#!groovy
node {
  tool name: 'recent node', type: 'nodejs'
  env.NODEJS_HOME = "${tool 'recent node'}"
   // on linux / mac
   env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
   echo '${env.PATH}'
  try {

    stage('Checkout') {
      echo 'Checkout...'
      checkout scm
      sh 'pwd'
    }
    stage('Build') {
      echo 'Building....'
      //tool name: 'recent node', type: 'nodejs'
    }
    stage('Test') {
      echo 'Building....'
    }
    stage('Deploy') {
      echo 'Deploying....'
    }
  }
  catch (err) {
    echo 'Build failded: ${err}'
  }
}
