import * as amqp from 'amqplib/callback_api';
import DB from "../../src/models";
const config = require('../../config');

const jobQ = 'job_queue'
const successQ = 'success_queue'

export async function setupMockQueue(){
    amqp.connect(`amqp://${config.AMQP.USER}:${config.AMQP.PASS}@${config.AMQP.HOST}:${config.AMQP.PORT}`,
        (err, connection) => {
            if (err) throw err

            connection.createChannel((err2, channel) => {

                channel.assertQueue(successQ)
                channel.assertQueue(jobQ)
                channel.consume(jobQ, (msg) => {
                    const job = JSON.parse(msg.content.toString())
                    let payload;
                    switch(job.scenario) {
                        case 'run': 
                            payload = {
                                id: job.id,
                                scenario: 'run',
                                stderr: 'Success',
                                stdout: 'Success'
                            }
                            break
                        case 'submit':
                            payload = {
                                id: job.id,
                                scenario: 'submit',
                                time: 1,
                                result: 'Success',
                                score: 100,
                                testcases: []
                            }
                            break
                        case 'project':
                            payload = {
                                id: job.id,
                                scenario: 'project',
                                stdout: 'stdout',
                                stderr: 'stderr',
                                time: 1,
                                code: 100,
                                score: 100
                            }
                            break
                    }
                    setTimeout(() => {
                        channel.sendToQueue(successQ, (new Buffer(JSON.stringify(payload))))
                        channel.ack(msg)
                    }, 1000)
                })
            })
        })
}

export async function truncateTables() {
    await DB.apikeys.destroy({truncate: true});
    await DB.langs.destroy({truncate: true});
    await DB.submissions.destroy({truncate: true});
}

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}