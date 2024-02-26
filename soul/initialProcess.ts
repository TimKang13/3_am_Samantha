import { externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import shouts from "./mentalProcesses/shouts.js";
import breakdown from "./mentalProcesses/breakdown.js";
import sentimental from "./mentalProcesses/sentimental.js";

const gainsTrustWithTheUser: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Talk to the user trying to gain assurance."),
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
  const shouldShout = await lastStep.compute(
    mentalQuery("The interlocuter is being rude")
  )
  log("User hurt soul's feeling?", shouldBreakdown)
  log("User mentions the good old days?", shouldSentimental)
  log("User attacked soul?", shouldShout)
  if (shouldBreakdown) {
    setNextProcess(breakdown)
  } else if (shouldSentimental){
    setNextProcess(sentimental)
  }else if(shouldShout){
    setNextProcess(shouts)
  } 

  return lastStep
}

export default gainsTrustWithTheUser
