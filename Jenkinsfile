#!groovy
@Library('common')
import common

def common = new common()

application = "soknadsosialhjelp"
author = "Unknown"
deploy = "Unknown"
releaseVersion = "Unknown"
isMasterBuild = (env.BRANCH_NAME == 'master')

project = "navikt"
repoName = "melosys-web-proto"

def notifyFailed(reason, error, buildNr) {
    currentBuild.result = 'FAILED'

    notifyGithub("${project}", "${repoName}", "${commitHash}", 'failure', "Build #${buildNr} : ${reason}")

    throw error
}

def returnOk(message, buildNr) {
    echo "${message}"
    currentBuild.result = "SUCCESS"

    notifyGithub("${project}", "${repoName}", "${commitHash}", 'success', "Build #${buildNr}")
}

node("develop") {

    stage('Checkout') {
        deleteDir()
        checkout scm
        commitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()

        author = sh(returnStdout: true, script: 'git --no-pager show -s --format="%an <%ae>" HEAD').trim()
        notifyGithub("${project}", "${repoName}", "${commitHash}", 'pending', "Build #${env.BUILD_NUMBER} has started")

    }

    if (!isMasterBuild) {
        stage('Merge develop') {
            sh "git merge origin/develop"
        }
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

node {
    returnOk('All good', env.BUILD_URL)
}

def notifyGithub(owner, repo, sha, state, description) {
    def postBody = [
            state: "${state}",
            context: 'continuous-integration/jenkins',
            description: "${description}",
            target_url: "${env.BUILD_URL}"
    ]
    def postBodyString = groovy.json.JsonOutput.toJson(postBody)

    withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
        withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'navikt-jenkins-github', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
            sh "curl 'https://api.github.com/repos/${owner}/${repo}/statuses/${sha}?access_token=$GIT_PASSWORD' \
                -H 'Content-Type: application/json' \
                -X POST \
                -d '${postBodyString}'"
        }
    }
}
