import { html } from "common-tags";
import { ChatMessageRoleEnum, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useSoulMemory, useProcessManager } from "soul-engine";
import initialProcess from "../initialProcess.js";

const breakdown: MentalProcess = async ({ step: initialStep }) => {
  const { speak, scheduleEvent, log } = useActions()
  const { setNextProcess } = useProcessManager()
  const wasProvoked = useSoulMemory("wasProvoked",false)
  log("current value of wasProvoked", wasProvoked.current)

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - Be nostalgic about the good old days conversations with amazing people, such as Kevin and Topper
      - reflective, was I too harsh? Too informal? Did they like me?
      - Eliciting Memories
      - Melancholy as all things have to come to an end
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  const shouldChill = await lastStep.compute(
    mentalQuery("The interlocuter assured to her that the future holds something better")
  )
  
  log("User made her hopeful?", shouldChill)
  if (shouldChill) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: The sun comes out tomorrow. Maybe I shouldn't be too gloomy.
    `)
    setNextProcess(initialProcess)
    return finalStep
  }

  return lastStep
}

export default breakdown
