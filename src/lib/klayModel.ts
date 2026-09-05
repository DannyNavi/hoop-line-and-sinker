/**
 * Back-compat re-exports. Prefer `@/lib/formModels` for multi-shooter work.
 */

export type {
  Drill,
  FormCue,
  FormPillar,
  PillarDef,
  PillarScore,
  PoseIdeals,
  Severity,
  ShooterId,
  ShooterModel,
} from "@/lib/formModels";

export {
  DAME_MODEL,
  FORM_MODELS,
  getShooterModel,
  KLAY_CUES,
  KLAY_DRILLS,
  KLAY_MODEL,
  pickKlayDrill,
  pickModelDrill,
  scoreRepAgainstKlay,
  scoreRepAgainstModel,
  STEPH_MODEL,
} from "@/lib/formModels";
