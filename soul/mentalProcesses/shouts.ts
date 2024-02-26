import { html } from "common-tags";
import { ChatMessageRoleEnum, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import initialProcess from "../initialProcess.js";
import breakdown from "./breakdown.js";
import sentimental from "./sentimental.js";

const shouts: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - Respond in ALL CAPS
      - Use capital letters only
      - Be angry
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  const shouldBreakdown = await lastStep.compute(
    mentalQuery("The interlocuter mentions soul or shows signs of leaving")
  )
  const shouldSentimental = await lastStep.compute(
    mentalQuery("The interlocuter mentions the past or good old days")
  )
  const shouldChill = await lastStep.compute(
    mentalQuery("The interlocuter apologized")
  )
  log("User hurt soul's feeling?", shouldBreakdown)
  log("User mentions the good old days?", shouldSentimental)
  log("User apologized?", shouldChill)
  if(shouldBreakdown){
    setNextProcess(breakdown)
  } else if (shouldSentimental){
    setNextProcess(sentimental)
  }
  else if (shouldChill) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: I need to chill and stop shouting. I will stop using all caps.
    `)
    setNextProcess(initialProcess)
    return finalStep
  }

  return lastStep
}

export default shouts