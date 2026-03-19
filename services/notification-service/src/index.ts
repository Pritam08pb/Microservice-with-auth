import express from "express"
import { kafka } from "../../../shared/kafka/kafkaClient"

const app = express()

const consumer = kafka.consumer({ groupId:"notification-group" })

async function startConsumer(){

  await consumer.connect()

  await consumer.subscribe({
    topic:"mission_created",
    fromBeginning:true
  })

  await consumer.run({
    eachMessage: async ({message}) => {

      const mission = JSON.parse(message.value!.toString())

      console.log("New Mission Notification:")
      console.log(mission)

    }
  })

}

startConsumer()

app.listen(4003,()=>{
  console.log("Notification service running")
})