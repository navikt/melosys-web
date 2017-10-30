#! groovy

node {
  def project = "navikt"
  def repoName = "melosys-web-proto"
  def application = "melosys"

  /* metadata */
  def commitHash, commitHashShort, commitUrl, committer

  /* tools */
  //tool name: 'recent node', type: 'nodejs'
  //def NODEJS_HOME = "${tool 'recent node'}"
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
      checkout scm
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
      // sh('rm -rf node_modules')
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
      sh(returnStdout: true, script: "${npm} run build")
      sh(returnStdout: true, script: "sudo docker build -t docker.adeo.no:5000/${application}/${commitHashShort} .")

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
