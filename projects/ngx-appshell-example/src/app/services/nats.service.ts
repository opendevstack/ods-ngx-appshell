import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { wsconnect, NatsConnection, Subscription } from '@nats-io/nats-core';
import { jetstreamManager } from '@nats-io/jetstream';
import { KV, Kvm, KvEntry } from '@nats-io/kv';

export interface NatsMessage {
  id: string;
  subject: string;
  data: any;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NatsService implements OnDestroy {
  private connection: NatsConnection | null = null;
  private kv: KV | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private messagesSubject: BehaviorSubject<NatsMessage[]> = new BehaviorSubject<NatsMessage[]>([]);
  private unreadMessagesCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private liveMessageSubject: BehaviorSubject<NatsMessage | null> = new BehaviorSubject<NatsMessage | null>(null);
  private connectionError = new Subject<Error>();

  public messages$: Observable<NatsMessage[]> = this.messagesSubject.asObservable();
  public unreadMessagesCount$: Observable<number> = this.unreadMessagesCountSubject.asObservable();
  public liveMessage$: Observable<NatsMessage | null> = this.liveMessageSubject.asObservable();
  public connectionError$: Observable<Error> = this.connectionError.asObservable();
  
  constructor() {}

  public async initialize(serverUrl: string): Promise<void> {
    try {
      this.connection = await wsconnect({ servers: serverUrl });
    } catch (error) {
      console.error('Failed to initialize NATS service', error);
      this.connectionError.next(error as Error);
      throw error;
    }
  }

  public async initializeUser(user: string): Promise<void> {
    try {      
      await this.initializeKvStore(user);
      await this.loadMessages(user);
    } catch (error) {
      console.error('Failed to initialize NATS service for user', error);
      this.connectionError.next(error as Error);
      throw error;
    }
  }

  private async initializeKvStore(user: string): Promise<void> {
    if (!this.connection) {
      throw new Error('NATS connection not established properly');
    }

    const bucketName = `bucket-${user}`;

    const publicKey = this.getPublicKey(user);
    const privateKey = this.getPrivateKey(user);

    try {
      const kvm: Kvm = new Kvm(this.connection);
      this.kv = await kvm.create(bucketName);

      const publicKv: KvEntry | null = await this.kv.get(publicKey);
      const privateKv: KvEntry | null = await this.kv.get(privateKey);

      if(!publicKv) {
        await this.kv.put(publicKey, '[]');
      }
      if(!privateKv) {
        await this.kv.put(privateKey, '[]');
      }
    } catch (error) {
      console.error('Failed to initialize KV store for user', error);
      throw error;
    }
  }

  /**
   * Load initial messages for all subjects from KV store
   */
  private async loadMessages(user: string): Promise<void> {
    if (!this.connection || !this.kv) {
      throw new Error('NATS connection or KV client not initialized');
    }
  
    const subjects = ['app.com.notifications.public', `app.com.notifications.private.${user}`];
  
    try {
      const jsm = await jetstreamManager(this.connection);
      const messages: NatsMessage[] = [];
  
      for (const subjectName of subjects) {
        const streamName = await jsm.streams.find(subjectName);
        if (!streamName) {
          console.error(`Stream not found for subject: ${subjectName}`);
          return;
        }
        const createdConsumer = await jsm.consumers.add(streamName, { deliver_policy: 'all', filter_subject: subjectName });
        const consumer = await jsm.jetstream().consumers.get(streamName, createdConsumer.name);
        const iter = await consumer.consume();
        const readIds = await this.getReadMessageIds(subjectName);
        (async () => {
          for await (const msg of iter) {
            try {
              const message: NatsMessage = {
                id: msg.headers?.get('Nats-Msg-Id') || '',
                subject: msg.subject,
                data: msg.json(),
                read: readIds.includes(msg.headers?.get('Nats-Msg-Id') || '')
              };
              if (this.isValidMessage(message.data)) {
                messages.push(message);
                if (message.data.date) {
                  const messageDate = new Date(message.data.date);
                  if (Date.now() - messageDate.getTime() <= 5000) { // We add a treshold of 5 seconds to show it as live message
                    this.liveMessageSubject.next(message);
                  }
                }
              }
              if (msg.info.pending === 0) {
                messages.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
                this.messagesSubject.next(messages);
                this.unreadMessagesCountSubject.next(messages.filter(m => !m.read).length);
              }
            } catch (error) {
              console.error('Error processing message:', error);
            }
          }
        })();
      }
    } catch (error) {
      console.error('Failed to load initial messages from stream', error);
      throw error;
    }
  }
  

  /**
   * Mark multiple messages as read by storing their IDs in the KV store
   * @param subject The subject the messages belong to
   * @param messageIds The array of message IDs to mark as read
   */
  public async readMessages(subject: string, messageIds: string[]): Promise<void> {
    if (!this.kv) {
      throw new Error('KV store not initialized');
    }

    try {
      const entry = await this.kv.get(subject);
      let readMessageIds: string[] = [];
      
      if (entry) {
        readMessageIds = JSON.parse(entry.string());
      }
      
      const newReadMessageIds = messageIds.filter(id => !readMessageIds.includes(id));
      if (newReadMessageIds.length > 0) {
        readMessageIds.push(...newReadMessageIds);
        await this.kv.put(subject, JSON.stringify(readMessageIds));
      }
      this.messagesSubject.next(this.messagesSubject.getValue().map(message => {
        if (messageIds.includes(message.id)) {
          message.read = true;
        }
        return message;
      }));
      this.unreadMessagesCountSubject.next(Math.max(0, this.messagesSubject.getValue().filter(m => !m.read && !readMessageIds.includes(m.id) ).length));
    } catch (error) {
      console.error(`Failed to mark messages as read: ${subject} - ${messageIds.join(', ')}`, error);
      throw error;
    }
  }

  /**
   * Get the list of read message IDs for a specific key from the KV store
   * @param key The key from the KV to get read message IDs for
   * @returns Array of read message IDs
   */
  public async getReadMessageIds(key: string): Promise<string[]> {
    if (!this.kv) {
      throw new Error('KV store not initialized');
    }

    try {
      const entry = await this.kv.get(key);
      
      if (!entry) {
        return [];
      }

      return JSON.parse(entry.string());
    } catch (error) {
      console.error(`Failed to get read messages for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Check if a specific message has been read
   * @param subject The subject the message belongs to in the KV store
   * @param messageId The ID of the message to check
   * @returns Boolean indicating if the message has been read
   */
  public async isMessageRead(subject: string, messageId: string): Promise<boolean> {
    const readMessageIds = await this.getReadMessageIds(subject);
    return readMessageIds.includes(messageId);
  }

  /**
   * Unsubscribe from all subjects, clear subscriptions and close the connection
   */
  public async close(): Promise<void> {
    for (const [subject, subscription] of this.subscriptions.entries()) {
      try {
        await subscription.unsubscribe();
      } catch (error) {
        console.error(`Error unsubscribing from ${subject}:`, error);
      }
    }
    
    this.subscriptions.clear();
    
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
  
  private getPublicKey(user: string): string {
    return `app.com.notifications.public.${user}.read`;
  }
  
  private getPrivateKey(user: string): string {
    return `app.com.notifications.private.${user}.read`;
  }

  isValidMessage(message: any): boolean {
    const requiredFields = ['type', 'title', 'date'];
    const hasRequiredFields = requiredFields.every(field => message.hasOwnProperty(field) && message[field] && message[field] !== '');
    const isValidDate = !isNaN(Date.parse(message.date));

    return hasRequiredFields && isValidDate;
  }

  ngOnDestroy(): void {
    this.close().catch(error => {
      console.error('Error closing NATS connection', error);
    });
  }
}