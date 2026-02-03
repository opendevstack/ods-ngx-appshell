import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NatsService, NatsMessage } from './nats.service';
import * as natsCore from '@nats-io/nats-core';
import * as jetstreamModule from '@nats-io/jetstream';
import * as kvModule from '@nats-io/kv';

describe('NatsService', () => {
  let service: NatsService;
  let mockConnection: jasmine.SpyObj<natsCore.NatsConnection>;
  let mockKvm: jasmine.SpyObj<kvModule.Kvm>;
  let mockKv: jasmine.SpyObj<kvModule.KV>;
  let mockJsm: any;
  let mockStreams: any;
  let mockConsumers: any;
  let mockJetstream: any;
  let mockConsumer: any;
  let mockIterator: any;
  let mockSubscription: jasmine.SpyObj<natsCore.Subscription>;
  
  let wsconnectSpy: jasmine.Spy;
  let jetstreamManagerSpy: jasmine.Spy;
  let kvmSpy: jasmine.Spy;
  
  let originalWsconnectDescriptor: PropertyDescriptor | undefined;
  let originalJetstreamManagerDescriptor: PropertyDescriptor | undefined;
  let originalKvmDescriptor: PropertyDescriptor | undefined;
  
  beforeAll(() => {
    originalWsconnectDescriptor = Object.getOwnPropertyDescriptor(natsCore, 'wsconnect');
    originalJetstreamManagerDescriptor = Object.getOwnPropertyDescriptor(jetstreamModule, 'jetstreamManager');
    originalKvmDescriptor = Object.getOwnPropertyDescriptor(kvModule, 'Kvm');
  });
  
  afterAll(() => {
    if (originalWsconnectDescriptor) {
      Object.defineProperty(natsCore, 'wsconnect', originalWsconnectDescriptor);
    }
    if (originalJetstreamManagerDescriptor) {
      Object.defineProperty(jetstreamModule, 'jetstreamManager', originalJetstreamManagerDescriptor);
    }
    if (originalKvmDescriptor) {
      Object.defineProperty(kvModule, 'Kvm', originalKvmDescriptor);
    }
  });

  beforeEach(() => {
    mockConnection = jasmine.createSpyObj('NatsConnection', ['close']);
    mockKvm = jasmine.createSpyObj('Kvm', ['create']);
    mockKv = jasmine.createSpyObj('KV', ['get', 'put']);
    mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    
    mockConsumer = {
      consume: jasmine.createSpy('consume').and.returnValue(Promise.resolve({
        [Symbol.asyncIterator]: () => ({
          next: jasmine.createSpy('next').and.resolveTo({
            done: true
          })
        })
      }))
    };
    
    mockConsumers = {
      add: jasmine.createSpy('add').and.returnValue(Promise.resolve({ name: 'test-consumer' })),
      get: jasmine.createSpy('get').and.returnValue(Promise.resolve(mockConsumer))
    };
    
    mockStreams = {
      find: jasmine.createSpy('find').and.returnValue(Promise.resolve('test-stream'))
    };
    
    mockJetstream = jasmine.createSpy('jetstream').and.returnValue({ consumers: mockConsumers });
    
    mockJsm = {
      streams: mockStreams,
      consumers: mockConsumers,
      jetstream: mockJetstream
    };
    
    wsconnectSpy = jasmine.createSpy('wsconnect').and.returnValue(Promise.resolve(mockConnection));
    jetstreamManagerSpy = jasmine.createSpy('jetstreamManager').and.returnValue(Promise.resolve(mockJsm));
    kvmSpy = jasmine.createSpy('Kvm').and.returnValue(mockKvm);
    
    Object.defineProperty(natsCore, 'wsconnect', { get: () => wsconnectSpy });
    Object.defineProperty(jetstreamModule, 'jetstreamManager', { get: () => jetstreamManagerSpy });
    Object.defineProperty(kvModule, 'Kvm', { get: () => kvmSpy });
    
    mockIterator = {
      [Symbol.asyncIterator]: function() {
        let count = 0;
        const messages = [
          {
            subject: 'app.com.notifications.public',
            json: jasmine.createSpy('json').and.returnValue({ type: 'alert', title: 'Test Alert', date: new Date().toISOString() }),
            headers: { get: (key: string) => key === 'Nats-Msg-Id' ? 'msg-1' : '' },
            info: { pending: 1 }
          },
          {
            subject: 'app.com.notifications.public',
            json: jasmine.createSpy('json').and.returnValue({ type: 'info', title: 'Test Info', date: new Date().toISOString() }),
            headers: { get: (key: string) => null },
            info: { pending: 0 }
          }
        ];
        
        return {
          next: async () => {
            if (count < messages.length) {
              return { value: messages[count++], done: false };
            } else {
              return { done: true };
            }
          }
        };
      }
    };
    
    mockConsumer.consume.and.returnValue(Promise.resolve(mockIterator));
    
    mockKvm.create.and.returnValue(Promise.resolve(mockKv));
    
    TestBed.configureTestingModule({
      providers: [NatsService]
    });
    
    service = TestBed.inject(NatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should establish a NATS connection', async () => {
      await service.initialize('ws://localhost:4222');
      expect(wsconnectSpy).toHaveBeenCalledWith({ servers: 'ws://localhost:4222' });
    });

    it('should handle connection errors', async () => {
      const testError = new Error('Connection failed');
      wsconnectSpy.and.returnValue(Promise.reject(testError));
      
      let capturedError: Error | undefined;
      service.connectionError$.subscribe(error => {
        capturedError = error;
      });
      
      await expectAsync(service.initialize('ws://localhost:4222')).toBeRejectedWith(testError);
      expect(capturedError).toBe(testError);
    });
  });

  describe('initializeUser', () => {
    beforeEach(async () => {
      await service.initialize('ws://localhost:4222');
    });

    it('should initialize KV store and load messages', async () => {
      const mockEntry = {
        string: jasmine.createSpy('string').and.returnValue('[]')
      };
      mockKv.get.and.returnValue(Promise.resolve(mockEntry as unknown as kvModule.KvEntry));
      
      await service.initializeUser('user123');
      
      expect(kvmSpy).toHaveBeenCalledWith(mockConnection);
      expect(mockKvm.create).toHaveBeenCalledWith('bucket-user123');
      
      expect(mockKv.get).toHaveBeenCalledWith('app.com.notifications.public.user123.read');
      expect(mockKv.get).toHaveBeenCalledWith('app.com.notifications.private.user123.read');
      
      expect(jetstreamManagerSpy).toHaveBeenCalledWith(mockConnection);
    });

    it('should throw an error if connection is not established when initializing kv store', async () => {
      (service as any).connection = null;
  
      await expectAsync((service as any).initializeKvStore('user123')).toBeRejectedWithError('NATS connection not established properly');
    });

    it('should handle errors in KV store initialization', async () => {
      const testError = new Error('KV creation failed');
      mockKvm.create.and.rejectWith(testError);
      
      let capturedError: Error | undefined;
      service.connectionError$.subscribe(error => {
        capturedError = error;
      });
      
      await expectAsync(service.initializeUser('user123')).toBeRejectedWith(testError);
      expect(capturedError).toBe(testError);
    });

    it('should throw an error if connection is not established when loading messages', async () => {
      (service as any).connection = null;
  
      await expectAsync((service as any).loadMessages('user123')).toBeRejectedWithError('NATS connection or KV client not initialized');
    });

    it('should handle errors while processing messages', async () => {
      spyOn(service, 'getReadMessageIds').and.returnValue(Promise.resolve([]));
      
      const invalidMessage = {
      subject: 'app.com.notifications.public',
      json: jasmine.createSpy('json').and.throwError('Invalid message format'),
      headers: { get: jasmine.createSpy('get').and.returnValue('msg-invalid') },
      info: { pending: 0 }
      };
    
      mockIterator[Symbol.asyncIterator] = function () {
      let count = 0;
      return {
        next: async () => {
        if (count === 0) {
          count++;
          return { value: invalidMessage, done: false };
        }
        return { done: true };
        }
      };
      };
    
      const consoleErrorSpy = spyOn(console, 'error');
    
      await service.initialize('ws://localhost:4222');
      await service.initializeUser('user123');
    
      await new Promise(resolve => setTimeout(resolve, 0));
    
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing message:', jasmine.any(Error));
    });

    it('should handle errors when loading initial messages from stream', async () => {
      const mockEntry = {
        string: jasmine.createSpy('string').and.returnValue('[]')
      };
      mockKv.get.and.returnValue(Promise.resolve(mockEntry as unknown as kvModule.KvEntry));
      await service.initializeUser('user123');
      mockStreams.find.and.throwError(new Error('Stream loading failed'));
  
      await expectAsync((service as any).loadMessages('user123')).toBeRejectedWithError('Stream loading failed');
    });
  });

  describe('readMessages', () => {
    beforeEach(async () => {
      await service.initialize('ws://localhost:4222');
      
      const mockEntry = {
        string: jasmine.createSpy('string').and.returnValue('["existing-id"]')
      };
      mockKv.get.and.returnValue(Promise.resolve(mockEntry as unknown as kvModule.KvEntry));
      
      await service.initializeUser('user123');
    });

    it('should mark messages as read', async () => {
      mockKv.get.calls.reset();
      mockKv.get.and.returnValue(Promise.resolve({
        string: jasmine.createSpy('string').and.returnValue('["existing-id"]')
      } as unknown as kvModule.KvEntry));
      
      await service.readMessages('subject1', ['msg-1', 'msg-2']);
      
      expect(mockKv.get).toHaveBeenCalledWith('subject1');
      expect(mockKv.put).toHaveBeenCalledWith('subject1', '["existing-id","msg-1","msg-2"]');
    });

    it('should not add duplicate message IDs', async () => {
      mockKv.get.calls.reset();
      mockKv.get.and.returnValue(Promise.resolve({
        string: jasmine.createSpy('string').and.returnValue('["msg-1","existing-id"]')
      } as unknown as kvModule.KvEntry));
      
      await service.readMessages('subject1', ['msg-1', 'msg-2']);
      
      expect(mockKv.put).toHaveBeenCalledWith('subject1', '["msg-1","existing-id","msg-2"]');
    });

    it('should throw an error if KV store is not initialized', async () => {
      (service as any).kv = null;
      
      await expectAsync(service.readMessages('subject1', ['msg-1'])).toBeRejectedWithError('KV store not initialized');
    });
    
    it('should throw an error if cannot mark as read', async () => {
      mockKv.get.and.throwError(new Error('fake'))
      await expectAsync(service.readMessages('subject1', ['msg-1'])).toBeRejectedWithError('fake');
    });
  });

  describe('getReadMessageIds', () => {
    beforeEach(async () => {
      await service.initialize('ws://localhost:4222');
      await service.initializeUser('user123');
    });

    it('should return read message IDs from KV store', async () => {
      mockKv.get.and.returnValue(Promise.resolve({
        string: jasmine.createSpy('string').and.returnValue('["msg-1","msg-2"]')
      } as unknown as kvModule.KvEntry));
      
      const readIds = await service.getReadMessageIds('subject1');
      
      expect(readIds).toEqual(['msg-1', 'msg-2']);
      expect(mockKv.get).toHaveBeenCalledWith('subject1');
    });

    it('should return empty array if key not found', async () => {
      mockKv.get.and.returnValue(Promise.resolve(null));
      
      const readIds = await service.getReadMessageIds('subject1');
      
      expect(readIds).toEqual([]);
    });

    it('should throw error if KV store not initialized', async () => {
      (service as any).kv = null;
      
      await expectAsync(service.getReadMessageIds('subject1')).toBeRejectedWithError('KV store not initialized');
    });

    
    it('should throw an error if cannot read', async () => {
      mockKv.get.and.throwError(new Error('fake'))
      await expectAsync(service.getReadMessageIds('subject1')).toBeRejectedWithError('fake');
    });
  });

  describe('isMessageRead', () => {
    beforeEach(async () => {
      await service.initialize('ws://localhost:4222');
      await service.initializeUser('user123');
      
      spyOn(service, 'getReadMessageIds').and.returnValue(Promise.resolve(['msg-1', 'msg-3']));
    });

    it('should return true for read messages', async () => {
      const isRead = await service.isMessageRead('subject1', 'msg-1');
      expect(isRead).toBeTrue();
      expect(service.getReadMessageIds).toHaveBeenCalledWith('subject1');
    });

    it('should return false for unread messages', async () => {
      const isRead = await service.isMessageRead('subject1', 'msg-2');
      expect(isRead).toBeFalse();
    });
  });

  describe('close', () => {
    it('should unsubscribe from all subscriptions and close connection', async () => {
      await service.initialize('ws://localhost:4222');
      (service as any).subscriptions.set('subject1', mockSubscription);
      (service as any).subscriptions.set('subject2', mockSubscription);
      
      await service.close();
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(2);
      expect((service as any).subscriptions.size).toBe(0);
      
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect((service as any).connection).toBeNull();
    });
    
    it('should catch the errors if there are failures', async () => {
      await service.initialize('ws://localhost:4222');
      (service as any).subscriptions.set('subject1', mockSubscription);
      mockSubscription.unsubscribe.and.throwError(new Error('fake'));      
      await expectAsync(service.close()).toBeResolved();
    });
  });

  describe('isValidMessage', () => {
    it('should return true for valid messages', () => {
      const validMessage = {
        type: 'alert',
        title: 'Test Alert',
        date: new Date().toISOString()
      };
      
      expect(service.isValidMessage(validMessage)).toBeTrue();
    });

    it('should return false for messages missing required fields', () => {
      const invalidMessage1 = {
        title: 'Test Alert',
        date: new Date().toISOString()
      };
      
      const invalidMessage2 = {
        type: 'alert',
        date: new Date().toISOString()
      };
      
      expect(service.isValidMessage(invalidMessage1)).toBeFalse();
      expect(service.isValidMessage(invalidMessage2)).toBeFalse();
    });

    it('should return false for messages with invalid date', () => {
      const invalidMessage = {
        type: 'alert',
        title: 'Test Alert',
        date: 'not-a-date'
      };
      
      expect(service.isValidMessage(invalidMessage)).toBeFalse();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call close method', () => {
      spyOn(service, 'close').and.returnValue(Promise.resolve());
      
      service.ngOnDestroy();
      
      expect(service.close).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when closing', fakeAsync(() => {
      const consoleErrorSpy = spyOn(console, 'error');
      const error = new Error('Close error');
      spyOn(service, 'close').and.returnValue(Promise.reject(error));
      
      service.ngOnDestroy();
      tick();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing NATS connection', error);
    }));
  });

  describe('loadMessages', () => {
    beforeEach(async () => {
      await service.initialize('ws://localhost:4222');
      
      const mockEntry = {
        string: jasmine.createSpy('string').and.returnValue('[]')
      };
      mockKv.get.and.returnValue(Promise.resolve(mockEntry as unknown as kvModule.KvEntry));
    });

    it('should load messages from streams and update subjects', async () => {
      spyOn(service, 'getReadMessageIds').and.returnValue(Promise.resolve([]));
      
      let capturedMessages: NatsMessage[] = [];
      service.messages$.subscribe(messages => {
        capturedMessages = messages;
      });
      
      let capturedLiveMessage: NatsMessage | null = null;
      service.liveMessage$.subscribe(message => {
        capturedLiveMessage = message;
      });
      
      await service.initializeUser('user123');
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockStreams.find).toHaveBeenCalledWith('app.com.notifications.public');
      expect(mockStreams.find).toHaveBeenCalledWith('app.com.notifications.private.user123');
      expect(mockConsumers.add).toHaveBeenCalledTimes(2);
      expect(mockConsumer.consume).toHaveBeenCalledTimes(2);
    });

    it('should handle stream not found', async () => {
      mockStreams.find.and.returnValue(Promise.resolve(null));
      
      const consoleErrorSpy = spyOn(console, 'error');
      
      await service.initializeUser('user123');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Stream not found for subject: app.com.notifications.public');
    });
  });
});