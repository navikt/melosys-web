#! groovy
import groovy.json.JsonSlurperClassic

node {
  def project = "navikt"
  def application = "melosys-web"
  def appConfig = "nais.yaml"
  def dockerRepo = "docker.adeo.no:5000"
  def groupId = "nais"

  /* metadata */
  def commitHash, commitHashShort, commitUrl, committer
  def scmVars
  /* tools */
  def NODEJS_HOME = tool "node-6.2.1"
  def node = "${NODEJS_HOME}/bin/node"
  def npm = "${NODEJS_HOME}/bin/npm"
  //env.NODEJS_HOME = "${tool 'recent node'}"
  //env.PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
  //echo("${env.PATH}")
  echo "${NODEJS_HOME}"

  try {
    // delete whole workspace before starting the build,
    // so that the 'git clone' command below doesn't fail due to
    // directory not being empty
    cleanWs()

    stage('Checkout') {
      echo('Checkout ...')
      scmVars = checkout scm
      scmVars.each { print it }
    }

    stage('initialize') {
      commitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
      commitHashShort = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
      commitUrl = "https://github.com/${project}/${application}/commit/${commitHash}"
      /* gets the person who committed last as "Surname, First name" */
      committer = sh(script: 'git log -1 --pretty=format:"%an"', returnStdout: true).trim()
    }

    stage('npm install ') {
      echo('npm install')
      // sh('ls -la')
      withEnv(["PATH+NODE=${NODEJS_HOME}",'HTTP_PROXY=http://webproxy-utvikler.nav.no:8088', 'NO_PROXY=adeo.no']) {
        //sh(returnStdout: true, script: "${npm} install")
        sh "${npm} install"
      }
    }
    stage('Test') {
      echo('CI=true npm test')
      sh "CI=true ${npm} test"
    }
    stage('Build') {
      echo('Build...')
      def version = sh(returnStdout: true, script: "${npm} version minor")
      echo("version=${version}")
      env.WORKSPACE = pwd()
      echo("workspace=${env.WORKSPACE}")
      def jsonText = readFile "package.json"
      def slurper = new JsonSlurperClassic()
      def jsonMap = (Map)slurper.parseText(jsonText)
      def v = jsonMap.get("version")
      println v
      /*
      def fileContents = new File('${workspace}/package.json').getText('UTF-8')
      def slurper = new JsonSlurper()
      def jsonMap = (Map)slurper.parseText(fileContents)
      def version = jsonMap.get("version")
      println version
      */
      /*
      withEnv(["PATH+NODE=${NODEJS_HOME}",'HTTP_PROXY=http://webproxy-utvikler.nav.no:8088', 'NO_PROXY=adeo.no']) {
        sh(returnStdout: true, script: "git push && git push --tag")
      }
      */
      sh(returnStdout: true, script: "${npm} run build")
      //sh(returnStdout: true, script: "sudo docker build -t docker.adeo.no:5000/${application}/${commitHashShort} .")
      sh "scp -r build/ B150245@e34apvl00327.devillo.no:melosys/build/"
      def imageName = "${dockerRepo}/${application}:${commitHashShort}"
      sh "mkdir -p docker/build"
      sh "cp Dockerfile docker"
      sh "cp -r build docker/build"
      sh "cd docker"
      sh "docker build -t ${imageName} ."
      sh "docker push ${imageName}"
      /*
      //withCredentials([usernamePassword(credentialsId: 'A150244', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
      withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'navikt-jenkins', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
        // available as an env variable, but will be masked if you try to print it out any which way
        sh 'echo $env.PASSWORD'
        // also available as a Groovy variable—note double quotes for string interpolation
        echo "$GIT_USERNAME"
      }
      */

    }
    /*
    stage('Deploy') {
      echo('TODO Deploy')
    }
    */
  }
  catch (err) {
    echo("Build failed! ${err}")
  }
}
