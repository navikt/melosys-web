#!groovy
node {
  try {

    stage('Checkout') {
      echo 'Checkout...'
      checkout scm
    }
    stage('Build') {
      echo 'Building....'
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
