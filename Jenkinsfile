pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git 'https://github.com/Naveen-prasanth-S/Fencing_web.git'
            }
        }

        stage('Build Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh 'docker-compose down'
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Check Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS '
        }
        failure {
            echo 'FAILED '
        }
    }
}
