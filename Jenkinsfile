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
      echo "commitHash=${commitHash}"
      commitHashShort = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
      echo "commitHashShort=${commitHashShort}"
      commitUrl = "https://github.com/${project}/${application}/commit/${commitHash}"
      echo "commitUrl=${commitUrl}"
      /* gets the person who committed last as "Surname, First name" */
      committer = sh(script: 'git log -1 --pretty=format:"%an"', returnStdout: true).trim()
      echo "committer=${committer}"
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
      //sh(returnStdout: true, script: "sudo docker build -t docker.adeo.no:5000/${application}/${commitHashShort} .")
      withCredentials([usernamePassword(credentialsId: 'A150244', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
        // available as an env variable, but will be masked if you try to print it out any which way
        sh 'echo $PASSWORD'
        // also available as a Groovy variable—note double quotes for string interpolation
        echo "$USERNAME"
      }

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
