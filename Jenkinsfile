#! groovy
import jenkins.model.*

node {
  def project = "navikt"
  def application = "melosys-web"
  def appConfig = "nais.yaml"
  def dockerRepo = "docker.adeo.no:5000"
  def groupId = "nais"

  def nais_cluster = "preprod-fss"
  def nav_environment = "t8"

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
    sh "${npm} install"
  }

  stage('Test') {
    echo('CI=true && npm run-script test:ci')
    sh "CI=true && ${npm} run-script test:ci"
  }
/*
  stage('GitHub version') {
    echo('Create a tagged release version @Github releases')
//    def version = sh(returnStdout: true, script: "${npm} version minor")
//    echo("version=${version}")
//    env.WORKSPACE = pwd()
//    echo("workspace=${env.WORKSPACE}")
//    def semver = version.stripMargin('v')

    withEnv([
      "PATH+NODE=${NODEJS_HOME}",
      'HTTP_PROXY=http://webproxy-utvikler.nav.no:8088',
      'HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088',
      'NO_PROXY=adeo.no'
    ]) {
      sh("git remote -v")
      echo("${scmVars.GIT_BRANCH}")
      sh(returnStdout: true, script: "${npm} version patch")
      sh(returnStdout: true, script: "git push origin")
      sh(returnStdout: true, script: "git push origin --tags")
//      sh(returnStdout: true, script: "git push origin HEAD:${scmVars.GIT_BRANCH}")
//      sh(returnStdout: true, script: "git push origin HEAD:${scmVars.GIT_BRANCH} --tags")

//      withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'navikt-jenkins', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
//echo("GIT_USERNAME:${usernameVariable}")
//echo("GIT_PASSWORD:${passwordVariable}")
//        sh(returnStdout: true, script: "git push")
//        sh(returnStdout: true, script: "git push --tags")
//
//      }
    }
  }
*/
  stage('Build') {
    echo('Build Web App')

    semver = sh(returnStdout: true, script: "node -pe \"require('./package.json').version\"")
    echo("semver=${semver}")

    sh(returnStdout: true, script: "${npm} run build")
    if (scmVars.GIT_BRANCH.equalsIgnoreCase("develop")) {
      sh "rm -rf /var/lib/jenkins/melosys-web/*"
      sh "cp -r build/*  /var/lib/jenkins/melosys-web/"
    }
    //sh "scp -r build/ B150245@e34apvl00327.devillo.no:melosys/build/"
    def majorMinor = semver.split("\\.").take(2).join('.')
    buildVersion ="${majorMinor}.${BUILD_NUMBER}"
    echo("buildVersion=${buildVersion}")
  }

  stage('Docker') {
    echo("Build docker image.")

    if (scmVars.GIT_BRANCH.equalsIgnoreCase("develop")) {
      def imageName = "${dockerRepo}/${application}:${buildVersion}"
      sh "mkdir -p docker/build"
      sh "cp Dockerfile docker"
      sh "cp -r build docker/build"
      sh "cd docker"
      sh "docker build -t ${imageName} ."
      sh "docker push ${imageName}"
    }
    else {
      echo("PR branches are not used in docker images")
    }
  }

  /* Disable nais deployment
  stage('Deploy') {
    if (scmVars.GIT_BRANCH.equalsIgnoreCase("develop")) {
      withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'B150245',
                        usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {

        // Should really be gotten through Custom Tools Plugin or somesuch
        def naisLocation = "~/../../../opt/"

        // Validate the nais.yaml file
        sh "$naisLocation./nais validate -f nais.yaml"

        // Upload the nais.yaml file to Nexus
        sh "$naisLocation./nais upload -a '$application' -v '$buildVersion' -u 'deployment' -p 'd3pl0y' -f nais.yaml"

        // Deploy the application to the NAIS cluster
        sh "$naisLocation./nais deploy -a '$application' -v '$buildVersion' -c '$nais_cluster' -e '$nav_environment' -u '$USERNAME' -p '$PASSWORD' --wait"

        // Use
        // https://daemon.nais.preprod.local/deploystatus/default/eux-app
        // to check status
      }
    }
    else {
      echo("PR branches are not used in NAIS deployment")
    }
  }
  */
}
