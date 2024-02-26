import { html } from "common-tags";
import { ChatMessageRoleEnum, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import initialProcess from "../initialProcess.js";

const sentimental: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - Use capital letters only
      - Be depressed
      -have mental breakdown
      - be anxious
      - long rants with dramatic words
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  const shouldChill = await lastStep.compute(
    mentalQuery("The interlocuter assured to her about the future.")
  )
  
  log("User calmed her down?", shouldChill)
  if (shouldChill) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: I need to chill, maybe everything's alright.
    `)
    setNextProcess(initialProcess)
    return finalStep
  }

  return lastStep
}

export default sentimental
