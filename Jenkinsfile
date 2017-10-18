#!groovy
node {
  try {

    stage('Checkout') {
      echo 'Checkout...'
      checkout scm
      sh 'pwd'
    }
    stage('Build') {
      echo 'Building....'
      tool name: 'recent node', type: 'nodejs'
      //sh 'npm install'
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
