// See https://www.opendevstack.org/ods-documentation/ for usage and customization.

@Library('ods-jenkins-shared-library@4.x') _

properties([[$class: 'BuildConfigProjectProperty', name: '', namespace: '', resourceVersion: '', uid: ''],
	buildDiscarder(logRotator(artifactDaysToKeepStr: '7', artifactNumToKeepStr: '30', daysToKeepStr: '7', numToKeepStr: '30')),
	disableResume(),
	parameters([
		booleanParam(
			name: 'RELEASE',
			defaultValue: false,
			description: '''Are we creating a new release?'''),

		string(
			name: 'RELEASE_VERSION',
			defaultValue: '',
			description: '''
				Version to use for the new release, with format <major>.<minor>.<debug> (f.e., 1.10.5).
				Only meaningful if the Release flag is checked.
				Always set a version higher than or equal to the current SNAPSHOT version.
				Release versions cannot be reused.
				If left blank, the default behaviour is turning the current snapshot version into a release version.
				F.e., if the current version is 1.10.3-SNAPSHOT, the default release version is 1.10.3.'''),

		string(
			name: 'DEVELOPMENT_VERSION',
			defaultValue: '',
			description: '''
				Version number of the next development version, with format <major>.<minor>.<debug>-SNAPSHOT (f.e., 1.10.5-SNAPSHOT).
				Only meaningful if the Release flag is checked.
				Always set a version higher than the release version being generated.
				If left blank, the default behaviour is incrementing the lowest version number of the release version
				being generated and adding the -SNAPSHOT suffix.
				F.e., if generating release version is 1.10.3, the default development version is 1.10.4-SNAPSHOT.'''),

		string(
			name: 'TAG',
			defaultValue: '',
			description: '''
				Tag to be applied to the source code of the release.
				Default value "v${project.version}", where project.version corresponds to the Maven POM.
				Only meaningful if the Release flag is checked.'''),

		string(
			name: 'GIT_USER_NAME',
			defaultValue: 'Jenkins EDPC',
			description: '''
				User name for git commits. Equivalent to git config user.name, but for this run only.'''),

		string(
			name: 'GIT_USER_EMAIL',
			defaultValue: 'jenkins-edpc-cd@example.com',
			description: '''
				User email for git commits. Equivalent to git config user.email, but for this run only.'''),

		booleanParam(
			name: 'DRY_RUN',
			defaultValue: false,
			description: '''
				If checked, no changes will be committed to the repository.
				Only meaningful if the Release flag is checked.'''),
	])
])

def repositories = [
  [id:'us-test', url:'https://nexus-ods.apps.us-test.ocp.aws.boehringer.com/repository', name:'/appshell'],
  [id:'eu-dev', url:'https://nexus-ods.apps.eu-dev.ocp.aws.boehringer.com/repository', name:'/appshell']
]

node {
  dockerRegistry  = env.DOCKER_REGISTRY
  project         = env.PROJECT_NAME
}

odsComponentPipeline(
  branchToEnvironmentMapping: [
    'master': 'test',
    '*': 'dev'
  ],
  sonarQubeBranch: '*',
  podContainers: [
    containerTemplate(
      name: 'jnlp', // do not change, see https://github.com/jenkinsci/kubernetes-plugin#constraints
      image: "${dockerRegistry}/ods/jenkins-agent-nodejs22:4.x",
      workingDir: '/tmp',
      resourceRequestCpu: '2000m',
      resourceLimitCpu: '2',
      resourceRequestMemory: '2Gi',
      resourceLimitMemory: '8Gi',
      alwaysPullImage: true,
      args: '${computer.jnlpmac} ${computer.name}'
    ),
  ],
  parameters: [
    release: params.RELEASE,
    releaseVersion: params.RELEASE_VERSION,
    developmentVersion: params.DEVELOPMENT_VERSION,
    tag: params.TAG,
    dryRun: params.DRY_RUN,
    gitUserName: params.GIT_USER_NAME,
    gitUserEmail: params.GIT_USER_EMAIL
  ]
) {
  context ->
    stageBuild(context)
	  odsComponentStageScanWithSonar(context)
    repositories.each { repository ->
      stagePublish(context, repository)
    }
}

def validateParams(def context) {
  if (context.config.parameters.release) {
    def releaseVersion = context.config.parameters.releaseVersion
    if (releaseVersion && !(releaseVersion == ~/^\d+\.\d+\.\d+$/)) {
      error "Invalid release version: ${releaseVersion}"
    }
    def developmentVersion = context.config.parameters.developmentVersion
    if (developmentVersion && !(developmentVersion == ~/^\d+\.\d+\.\d+-SNAPSHOT$/)) {
      error "Invalid development version: ${developmentVersion}"
    }
    if (!context.config.parameters.gitUserName) {
      error "User name for git commits cannot be empty."
    }
    if (!context.config.parameters.gitUserEmail) {
      error "User email for git commits cannot be empty."
    }
  }
}

def stageBuild(def context) {
  stage('Build') {
    echoInfo("Building library")

    withEnv(["TAGVERSION=${context.tagversion}", "NEXUS_HOST=${context.nexusHost}"]) {
      sh 'npm install'
      sh 'npm run pack-lib'

      dir('dist/ngx-appshell') {
        archiveArtifacts artifacts: '**.tgz', fingerprint: true, allowEmptyArchive: true, defaultExcludes: false
      }
    }
  }
  stage('Unit test') {
    echoInfo("Executing Unit Tests")

    withEnv(["TAGVERSION=${context.tagversion}", "NEXUS_HOST=${context.nexusHost}"]) {
      sh 'npm run test'

      junit testResults: 'projects/ngx-appshell/build/test-results/test/*.xml', allowEmptyResults: true
    }
  }
}

def stagePublish(def context, def repository) {
  stage("Publish: ${repository.id}") {
    echoInfo("Publishing in ${repository.url}${repository.name}/")

    withCredentials([usernamePassword(credentialsId: "${project}-nexus-${repository.id}-appshell",
                                            usernameVariable: 'NEXUS_USERNAME',
                                            passwordVariable: 'NEXUS_PASSWORD')]) {
      withEnv(["NPM_USER=${NEXUS_USERNAME}", "NPM_PASS=${NEXUS_PASSWORD}", "NODE_EXTRA_CA_CERTS=/etc/pki/ca-trust/extracted/pem/objsign-ca-bundle.pem", "npm_config_cache=${WORKSPACE}/.npm/"]) {
        try {
          dir('dist/ngx-appshell') {
            sh 'rm -rf .npmrc'
            sh "echo registry=${repository.url}${repository.name}/ >> .npmrc"
            def urlWithoutProtocol = repository.url.replace('https://','')
            sh """echo //${urlWithoutProtocol}${repository.name}/:_auth=\$(echo -n \$NPM_USER:\$NPM_PASS | base64 ) >> .npmrc"""

            sh 'npm whoami'
            sh "npm publish --registry ${repository.url}${repository.name}/"
          }
        } catch (Exception e) {
          echoError("Failed to publish to NPM registry: ${repository.url}${repository.name}/")

          // Archive logs
          dir("${WORKSPACE}/.npm") {
            archiveArtifacts artifacts: '**', fingerprint: false, allowEmptyArchive: true, defaultExcludes: false
          }

          currentBuild.result = 'FAILURE'
          return
        }
      }
    }
  }
}

def echoInfo(msg) {
  echo "\033[32m ${msg} \033[0m"
}

def echoError(msg) {
  echo "\033[31m ${msg} \033[0m"
}
