pipeline {
    agent any

    // 🔴 THIS IS THE MISSING PIECE 🔴
    // It tells Jenkins to inject the "NodeJS" tool we installed in the Dashboard
    tools {
        nodejs 'NodeJS' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('server') {
                    // Now 'npm' will work because the tool is loaded
                    sh 'npm install'
                    sh 'node -c index.js'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
    }
}