#!groovy

def notifyFailed(reason, error, buildNr) {
  currentBuild.result = 'FAILED'
  //notifyGithub("${project}", "${repoName}", "${commitHash}", 'failure', "Build #${buildNr} : ${reason}")
  sh 'echo "${project}, ${repoName}, ${commitHash}, \'failure\', Build #${buildNr} : ${reason}"'
  throw error
}
/*def returnOk(message, buildNr) {
  echo "${message}"
  currentBuild.result = "SUCCESS"

  //notifyGithub("${project}", "${repoName}", "${commitHash}", 'success', "Build #${buildNr}")
  print("${project}", "${repoName}", "${commitHash}", 'success', "Build #${buildNr}")
}*/
node {
  echo 'Jenkins Ci Test'
  stage('Checkout') {
    sh 'pwd'
    //deleteDir()
    def scmVars = checkout scm
    print scmVars
    commitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()

    author = sh(returnStdout: true, script: 'git --no-pager show -s --format="%an <%ae>" HEAD').trim()
    //notifyGithub("${project}", "${repoName}", "${commitHash}", 'pending', "Build #${env.BUILD_NUMBER} has started")
    echo "${project}, ${repoName}, ${commitHash}, 'pending', Build #${env.BUILD_NUMBER} has started"
  }


  dir(".") {
      stage('Install') {
          try {
              sh "npm install"
          } catch (Exception e) {
              notifyFailed("Bygg feilet ved npm-install", e, env.BUILD_URL)
          }
      }

      stage('Test') {
          try {
              sh "CI=true npm run test"
          } catch (Exception e) {
              notifyFailed("Tester feilet", e, env.BUILD_URL)
          }
      }

      stage('Build') {
          try {
              sh "npm run build"
          } catch (Exception e) {
              notifyFailed("Bygging av JS feilet", e, env.BUILD_URL)
          }
      }
  }
}
