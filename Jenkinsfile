#! groovy
import jenkins.model.*

node {
  def project = "navikt"
  def application = "melosys-web"
  def webMockDir = "/var/lib/jenkins/melosys-web/"
  def zipFile

  /* metadata */
  def buildVersion // major.minor.BUILD_NUMBER
  def semver
  def commitHash, commitHashShort, commitUrl, committer
  def scmVars

  /* tools */
  def NODEJS_HOME = tool "node-8.9.4" // => "installation directory" = "/opt/node"
  echo "${NODEJS_HOME}"
  def node = "${NODEJS_HOME}/bin/node"
  def npm = "${NODEJS_HOME}/bin/npm"
  //env.PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
  //echo("${env.PATH}")

  // delete whole workspace before starting the build,
  // so that the 'git clone' command below doesn't fail due to
  // directory not being empty
  cleanWs()

  stage('Checkout') {
    echo('Checkout from Github ...')
    scmVars = checkout scm
    scmVars.each { print it }
  }

  stage('Initialize scm') {
    commitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
    commitHashShort = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
    commitUrl = "https://github.com/${project}/${application}/commit/${commitHash}"
    // gets the person who committed last as "Surname, First name"
    committer = sh(script: 'git log -1 --pretty=format:"%an"', returnStdout: true).trim()
  }

  stage('npm install ') {
    echo('Step: npm install package depenencies')
    sh "${node} -v"
    sh "${npm} -v"
    sh "${npm} config ls"
    sh "${npm} install"
  }

  stage('Test') {
    echo('CI=true && npm run-script test:ci')
    sh "CI=true && ${npm} run-script test:ci"
  }

  stage('Build') {
    echo('Build Web App')

    semver = sh(returnStdout: true, script: "node -pe \"require('./package.json').version\"")
    echo("semver=${semver}")
    def majorMinor = semver.split("\\.").take(2).join('.')
    buildVersion ="${majorMinor}.${BUILD_NUMBER}"
    echo("buildVersion=${buildVersion}")

    sh "${npm} run build"
    sh "${npm} prune"
  }

  stage('Create Zip artifact') {
    sh "rm -rf $webMockDir*" // Clean the content, don't remove top folder
    sh "cp -r build/* $webMockDir"
    zipFile = "${application}-${buildVersion}"+".zip"
    echo("zipFile:${zipFile}")
    sh "cd build/; zip -r ../$zipFile *; cd .."
    sh "cp ${zipFile} $webMockDir"
  }

  stage('Deploy to Nexus') {
    if (scmVars.GIT_BRANCH.equalsIgnoreCase("develop")) {
      configFileProvider(
        [configFile(fileId: 'navMavenSettings', variable: 'MAVEN_SETTINGS')]) {
        sh """
     	  	mvn --settings ${MAVEN_SETTINGS} deploy:deploy-file -Dfile=${zipFile} -DartifactId=${application} \
	            -DgroupId=no.nav.melosys -Dversion=${buildVersion} \
	 	        -Ddescription='Melosys-web web applicatioin' \
		        -DrepositoryId=m2internal -Durl=http://maven.adeo.no/nexus/content/repositories/m2internal
        """
      }
    }
    else {
      echo("branch artifacts are ignored.")
    }
  }
}
