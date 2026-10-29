import type { ConversationMessage } from '@/database/schema/conversations';

export type Trouble = 'peeling' | 'cracks' | 'bubbles' | 'colour' | 'drying' | 'mix';
export type TroubleProduct = 'x_bond' | 'microbond' | 'membrane' | 'satin' | 'natural' | 'titan' | 'matte' | 'sealer';
export type Check = 'timing' | 'surface' | 'product' | 'layer' | 'primer' | 'cleanliness' | 'width' | 'movement' | 'location' | 'shape' | 'sealed' | 'batches' | 'elapsed' | 'climate' | 'stage' | 'mixWhen' | 'recipe' | 'mixSpeed' | 'progress' | 'haze';

export const normalizeTroubleText = (text: string) => text.toLowerCase().replace(/[’']/g, '').replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim();

/** A prompt has one decision, never a combination of already-known answers. */
export const CHECKS: Record<Check, { question: string; choices: string[]; help: string }> = {
  timing: { question: 'Is it still wet, or has it dried to the touch?', choices: ['Still wet', 'Dry to the touch'], help: 'Think about what you can see without disturbing the finish. A wet layer may look wet or transfer onto a tool already used on it. Do not press into a sound area just to test it. The time on the clock alone does not prove it is dry.' },
  surface: { question: 'What surface is underneath—concrete, tile, wood or board?', choices: ['Concrete underneath', 'Tile underneath', 'Plywood underneath', 'Board underneath'], help: 'Check the project notes, a leftover sheet or an already-exposed edge. Concrete is the hard slab; tile has grout lines; wood and board usually have sheet joints. Do not cut or peel the finish to find out.' },
  product: { question: 'Which product or layer has the problem?', choices: ['X-Bond', 'Liquid Membrane', 'Sealer'], help: 'Look at the name on the pail or bag used for that layer, or the project material list. Liquid Membrane is normally the orange waterproofing layer; X-Bond is the stone finish; sealer is the protective treatment over it. The label is more reliable than appearance.' },
  layer: { question: 'Is only the top layer coming away, or are several layers lifting together?', choices: ['Only the top coat lifts', 'Layers lift together', 'Surface underneath is dusty'], help: 'Look at a piece that has already come loose—do not pull up sound material. Compare its underside with the exposed patch. A thin skin with the finish left in place points to the top layer; finish and lower layers attached together points deeper. This text chat cannot inspect photos, but you can describe what you see.' },
  primer: { question: 'Was the X-Bond Liquid primer still tacky when you put the mix onto it?', choices: ['Primer was still tacky', 'Primer had dried first', 'No primer was used'], help: 'Think back to the moment you spread the mix: the primer should still have been tacky, rather than a fully dry film. Check with whoever rolled it or compare the recorded priming and coating times. Do not apply fresh primer over a loose coat.' },
  cleanliness: { question: 'Was the layer underneath clean and firm, or dusty, loose or coated with residue?', choices: ['Clean and firm underneath', 'Dusty underneath', 'Old paint or residue underneath'], help: 'Inspect only an already-exposed area and any material already loose. Look for dust, paint coming away, grease or cleaning residue. Do not sand an unknown old coating or use a stronger cleaner just to experiment.' },
  width: { question: 'How wide is the crack—hairline, or a gap you can measure?', choices: ['Hairline crack', 'About 1/8 inch wide', 'More than 1/4 inch wide'], help: 'Hold a ruler next to the widest visible part and note the width; do not open the crack with a tool. A clear photo with the ruler helps you compare it later. If it is too fine to measure, describe it as a hairline.' },
  movement: { question: 'Has the crack stayed the same, or is it opening up or moving?', choices: ['Unchanged, no movement', 'It is getting wider', 'The board or floor moves'], help: 'Compare with an earlier photo or mark the location in your notes and record the visible width. Notice movement during normal use; do not load or push on the surface to test it. One look cannot establish that a crack is stable.' },
  location: { question: 'Does it follow a sheet seam or an intentional joint, or run across the middle of the surface?', choices: ['At a sheet seam', 'At an intentional movement joint', 'Across the middle of the surface'], help: 'Compare the crack with the sheet layout, grout lines or joint plan. A regular straight line where sheets meet is a useful clue, but it is not proof. Keep an intentional movement joint distinct from an accidental crack.' },
  shape: { question: 'Are these tiny open holes, or raised bubbles or blisters?', choices: ['Tiny open holes', 'Raised blisters'], help: 'Look from the side with a light. A pinhole is an opening going into the layer; a blister stands above it like a little dome. Do not pop, cut or press a blister to check.' },
  sealed: { question: 'Was the colour difference visible before sealing, or only after the sealer went on?', choices: ['Visible before sealing', 'Only after sealing'], help: 'Compare the photos from before and after the sealer, if you have them. If the colour was already uneven before sealing, the sealer is not the only thing to investigate. Do not add tint to the sealer to test a colour change.' },
  batches: { question: 'Was that area mixed as one batch or several separate batches?', choices: ['One batch', 'Multiple batches'], help: 'Check how many separate buckets were mixed and whether the patch boundary lines up with a new bucket. Several buckets from the same product lot still count as separate mixed batches.' },
  elapsed: { question: 'How long ago did you apply it?', choices: ['About 2 hours ago', 'Yesterday', 'More than 2 days ago'], help: 'Check the batch time, photos or messages from when that coat was finished. An approximate time is useful—tell me if it is only an estimate. Do not assume overnight means ready for another coat.' },
  climate: { question: 'What is the temperature and humidity like around the surface?', choices: ['Cool and humid', 'Warm and dry', 'Hot or in direct sun'], help: 'A room thermometer and humidity meter are best. If you do not have them, describe the conditions: cold room, damp air, condensation, direct sun or comfortable indoor conditions. That helps, but it does not replace a measured readiness check.' },
  stage: { question: 'Is this the first bonding coat, a floor finish or a wall finish?', choices: ['X-Bond floor scratch coat', 'X-Bond floor finish', 'X-Bond wall finish'], help: 'The scratch coat is the first thin bonding coat; the finish coats create the final surface; a wall finish uses the vertical-surface recipe. A thick levelling or brown coat is a separate procedure, not one of these recipes.' },
  mixWhen: { question: 'Was the mix wrong straight away, or did it thicken after sitting in the bucket?', choices: ['Wrong straight away', 'Thickened after sitting'], help: 'Think back to the first slow mix. If it was already wrong then, check the measured recipe and powder. If it started correctly and later stiffened, batch age and conditions matter. Do not add liquid by eye to make an old batch workable.' },
  recipe: { question: 'Do your measured amounts match that recipe?', choices: ['My measured amounts match', 'My measured amounts were different'], help: 'Compare the actual liquid and powder measures written in your batch notes, using the same size measure for each part. Do not count a full bag as one part, or assume a pail and a bag are equal measures.' },
  mixSpeed: { question: 'Was it mixed slowly with the square paddle, or quickly with a different paddle?', choices: ['Low speed with square paddle', 'High speed or different paddle'], help: 'Check the mixer setting and paddle shape. The SIP procedure specifies a square paddle at low speed, 180–200 RPM, to avoid whipping air into the mix. A fast drill can trap air even when the amounts are correct.' },
  progress: { question: 'Is it gradually becoming firmer, or staying just as soft or sticky?', choices: ['Gradually becoming firmer', 'No improvement', 'It is dry now'], help: 'Compare an already-observed edge or leftover sample over time without walking on or marking the installed finish. A surface skin does not prove the material underneath is cured. Record whether the condition is improving rather than testing the finish repeatedly.' },
  haze: { question: 'Do the cloudy marks line up with heavier or puddled areas?', choices: ['Yes, heavier or puddled areas', 'No, even thin coats'], help: 'Look across the surface from an angle. Compare cloudy patches with low spots, roller overlaps or areas where sealer collected. Do not add cleaner, solvent or another coat as a test.' },
};

export function previousCheck(message: ConversationMessage | undefined): Check | undefined {
  if (message?.provider !== 'local-instructor') return undefined;
  // Choices survive saving/reopening the chat, including the simpler help wording.
  const direct = (Object.keys(CHECKS) as Check[]).find((key) => CHECKS[key].choices.every((choice) => message.quickReplies?.includes(choice)));
  if (direct) return direct;
  if (/which exact sealer|what exact product/i.test(message.content)) return 'product';
  return undefined;
}

const UNKNOWN = /\b(?:not sure|dont know|do not know|cannot tell|cant tell|unsure|no idea|dont have|do not have)\b/;
export const isUncertain = (text: string) => UNKNOWN.test(normalizeTroubleText(text));
export const wantsCheckHelp = (text: string) => /\b(?:how (?:do|can|would) i (?:check|tell|know|measure)|what do you mean|explain|dont understand|do not understand)\b/.test(normalizeTroubleText(text));
export const wantsNext = (text: string) => /^(?:(?:ok|okay|thanks|done)[,.! ]*)?(?:what(?:s| is)? (?:the )?next(?: step)?|next(?: step)?|i (?:already )?checked (?:that|it|everything)(?:[,.! ]+what(?:s| is)? next)?|checked|all checked|done)[?.! ]*$/.test(normalizeTroubleText(text));

export function answersCheck(text: string, check: Check | undefined): boolean {
  const t = normalizeTroubleText(text);
  if (!check) return false;
  if (isUncertain(t) || wantsCheckHelp(t) || wantsNext(t)) return true;
  if (check === 'timing') return /^(?:it (?:is|has) |its |has )?(?:not )?(?:still wet|dried|dry to the touch|not dried yet|it is dry now)/.test(t);
  if (check === 'primer') return /\bprimer\b/.test(t) && !/\b(?:sealer|matte|satin|natural shield)\b/.test(t);
  return false;
}

export function troubleProductFrom(text: string): TroubleProduct | undefined {
  const t = normalizeTroubleText(text).replace(/\b(?:not|isnt|is not|no|without)\s+(?:(?:using|applying)\s+)?(?:the\s+)?(?:x ?bond|micro ?bond|liquid membrane|membrane|satin(?: stone)?|natural shield|titan(?: gloss| shield)?|matte|sealer)\b/g, '');
  // The material underneath is not automatically the failed layer.
  const foreground = t.split(/\b(?:over|underneath|on top of|with .+ underneath)\b/)[0];
  const rules: [TroubleProduct, RegExp][] = [['satin', /\bsatin(?: stone)?\b/], ['natural', /\bnatural shield\b/], ['titan', /\btitan(?: gloss| shield)?\b/], ['matte', /\bmatte\b/], ['membrane', /\b(?:liquid membrane|membrane|orange layer)\b/], ['microbond', /\bmicro ?bond\b/], ['x_bond', /\bx ?bond\b/], ['sealer', /\bsealer\b/]];
  return rules.find(([, pattern]) => pattern.test(foreground))?.[0];
}

export interface TroubleEvidence {
  product?: TroubleProduct;
  timing?: 'dry' | 'wet';
  layer?: 'top' | 'together';
  primer?: 'tacky' | 'dry' | 'none';
  cleanliness?: 'clean' | 'dust' | 'residue';
  width?: 'hairline' | 'measured';
  movement?: 'stable' | 'moving';
  location?: 'seam' | 'joint' | 'middle';
  shape?: 'holes' | 'blisters';
  sealed?: 'before' | 'after';
  batches?: 'one' | 'several';
  elapsed?: string;
  climate?: string;
  stage?: 'scratch' | 'wall' | 'finish' | 'brown';
  mixWhen?: 'immediate' | 'stood';
  recipe?: 'correct' | 'wrong';
  mixSpeed?: 'slow' | 'fast';
  progress?: 'better' | 'same' | 'dry';
  haze?: 'pooled' | 'even';
  addedLiquid?: boolean;
  leak?: boolean;
  unresolved: Set<Check>;
  explained: Set<Check>;
}

/** Facts only come from installer turns. Latest explicit corrections win. */
export function collectTroubleEvidence(messages: ConversationMessage[], current: string): TroubleEvidence {
  const evidence: TroubleEvidence = { unresolved: new Set(), explained: new Set() };
  const all = [...messages, { role: 'user', content: current } as ConversationMessage];
  all.forEach((message, index) => {
    if (message.role !== 'user') return;
    const t = normalizeTroubleText(message.content);
    const check = previousCheck(all[index - 1]);
    if (check && (isUncertain(t) || wantsCheckHelp(t) || wantsNext(t))) { evidence.unresolved.add(check); evidence.explained.add(check); }
    const named = troubleProductFrom(t);
    if (named && !(named === 'sealer' && evidence.product && ['satin', 'natural', 'titan', 'matte'].includes(evidence.product))) evidence.product = named;
    if (/\b(?:not|isnt|hasnt|havent|is not)\s+(?:yet\s+)?(?:dry|dried|cured)|\b(?:while (?:im |i am )?(?:applying|trowelling|rolling)|during application|still applying|still wet|wet now|freshly applied)\b/.test(t) || (check === 'timing' && /^(?:it (?:is|was)|its)?\s*wet\b/.test(t))) evidence.timing = 'wet';
    else if (/\b(?:after (?:it )?(?:dried|drying)|dried|cured|already dry|dry to (?:the )?touch|not wet anymore|it is dry now|its dry now)\b/.test(t) || (check === 'timing' && /^(?:it (?:is|was)|its)?\s*dry\b/.test(t))) evidence.timing = 'dry';
    if (/\b(?:only (?:the )?(?:top|sealer)|just (?:the )?(?:top|sealer))\b/.test(t)) evidence.layer = 'top';
    if (/\b(?:layers? (?:lift|come)|all (?:the )?layers|several layers|everything comes away)\b/.test(t)) evidence.layer = 'together';
    if (/\b(?:primer|priming)\b.*\b(?:tacky|wet)\b/.test(t)) evidence.primer = 'tacky';
    if (/\b(?:primer|priming)\b.*\b(?:completely dry|had dried|dry first|dried first|was dry|is dry)\b/.test(t)) evidence.primer = 'dry';
    if (/\b(?:no primer|didnt prime|did not prime|without primer)\b/.test(t)) evidence.primer = 'none';
    if (/\b(?:dusty|powdery|loose (?:surface|paint)|paint comes off)\b/.test(t) && !/\b(?:not|isnt|is not) (?:dusty|powdery)\b/.test(t)) evidence.cleanliness = 'dust';
    if (/\b(?:old paint|residue|greas[ey]|oil|wax|old coating)\b/.test(t) && !/\b(?:no|without) (?:old paint|residue|grease|oil|wax|old coating)\b/.test(t)) evidence.cleanliness = 'residue';
    if (/\b(?:clean and (?:firm|solid)|firm and clean|not dusty|no dust|no residue|clean underneath|clean base)\b/.test(t)) evidence.cleanliness = 'clean';
    if (/\b(?:hairline|thin line)\b/.test(t)) evidence.width = 'hairline';
    if (/\b(?:measur(?:ed|able)|gap|\d+(?:\/\d+)?\s*(?:mm|inch|inches))\b/.test(t) && !/\b(?:cant measure|cannot measure|no gap)\b/.test(t)) evidence.width = 'measured';
    const risk = t.replace(/\b(?:not|isnt|is not|no|stopped)\s+(?:any\s+)?(?:growing|widening|getting wider|moving|movement|bouncing|structural movement|(?:active )?leak(?:ing)?)\b/g, '');
    if (/\b(?:growing|widening|getting wider|still moving|bouncing|structural movement|board (?:or floor )?(?:is )?moves?|floor (?:is )?moves?)\b/.test(risk)) evidence.movement = 'moving';
    else if (/\b(?:unchanged|not (?:growing|moving|changing)|hasnt changed|has not changed|no movement|stable|stayed the same|stopped moving|same as (?:last|before))\b/.test(t) && (evidence.movement !== 'moving' || /\b(?:actually|correction|mistaken|meant)\b/.test(t))) evidence.movement = 'stable';
    if (/\b(?:sheet seams?|sheet joints?|where (?:the )?sheets meet)\b/.test(t)) evidence.location = 'seam';
    if (/\b(?:intentional|movement|expansion|control|existing) joint\b/.test(t)) evidence.location = 'joint';
    if (/\b(?:across the middle|middle of|random|not (?:at|along) (?:a )?(?:seam|joint))\b/.test(t)) evidence.location = 'middle';
    if (/\b(?:pinholes?|pin holes|tiny (?:open )?holes)\b/.test(t) && !/\b(?:not|no) (?:pinholes|holes|tiny holes)\b/.test(t)) evidence.shape = 'holes';
    if (/\b(?:raised (?:bubbles|blisters)|domes|blisters)\b/.test(t) && !/\b(?:not|no) (?:raised )?(?:bubbles|blisters)\b/.test(t)) evidence.shape = 'blisters';
    if (/\b(?:before (?:the )?seal(?:er|ing)|not sealed|unsealed|no sealer)\b/.test(t)) evidence.sealed = 'before';
    else if (/\b(?:after (?:the )?seal(?:er|ing)|sealed|sealer (?:is )?(?:on|applied))\b/.test(t)) evidence.sealed = 'after';
    if (/\b(?:one|single|same) (?:mixed )?batch\b/.test(t) || (check === 'batches' && /^(?:just |only )?one[.! ]*$/.test(t))) evidence.batches = 'one';
    if (/\b(?:multiple|different|two|separate|several) (?:mixed )?(?:batches|buckets)\b/.test(t) || (check === 'batches' && /^(?:multiple|different|two|three|four|several)[.! ]*$/.test(t))) evidence.batches = 'several';
    if (/\b(?:(?:\d+(?:\.\d+)?|one|two|three|four|five|six|a couple|a few|an?)\s*(?:minutes?|mins?|hours?|hrs?|days?)|overnight|yesterday|this morning|last night)\b/.test(t)) evidence.elapsed = message.content;
    if (/\b(?:cold|cool|warm|hot|humid|humidity|temperature|degrees|direct sun|condensation)\b/.test(t) && !isUncertain(t) || /\d+\s*°?\s*(?:c|f)\b/.test(t)) evidence.climate = message.content;
    const coat = t.replace(/\b(?:not|isnt|is not)\s+(?:the\s+)?(?:scratch coat|scratch|wall finish|wall|floor finish|finish coat|bonding coat)\b/g, '');
    if (/\b(?:brown coat|levelling coat|leveling coat|build up coat)\b/.test(coat)) evidence.stage = 'brown';
    else if (/\b(?:scratch|bonding coat)\b/.test(coat)) evidence.stage = 'scratch';
    else if (/\b(?:wall|vertical)\b/.test(coat)) evidence.stage = 'wall';
    else if (/\b(?:floor finish|finish coat|micro ?bond)\b/.test(coat)) evidence.stage = 'finish';
    if (/\b(?:right away|straight away|as soon as|immediately|from the start)\b/.test(t)) evidence.mixWhen = 'immediate';
    if (/\b(?:after standing|after sitting|sat for|sitting in|thickened|started (?:okay|fine))\b/.test(t)) evidence.mixWhen = 'stood';
    if (/\b(?:amounts (?:were different|dont match|do not match)|recipe was different|wrong amounts|wrong ratio)\b/.test(t)) evidence.recipe = 'wrong';
    else if (/\b(?:amounts (?:match|were correct)|correct ratio|recipe (?:matches|is correct)|same measures)\b/.test(t)) evidence.recipe = 'correct';
    if (/\b(?:high speed|fast|different paddle|spiral paddle)\b/.test(t)) evidence.mixSpeed = 'fast';
    if (/\b(?:low speed|slowly|square paddle)\b/.test(t) && !/\b(?:not|no) (?:low speed|square paddle)\b/.test(t) && !/\b(?:high speed|fast)\b/.test(t)) evidence.mixSpeed = 'slow';
    if (/\b(?:gradually|becoming firmer|getting firmer|drying steadily|improving|better)\b/.test(t)) evidence.progress = 'better';
    if (/\b(?:no improvement|not improving|just as (?:soft|sticky)|staying (?:soft|sticky)|same as before)\b/.test(t)) evidence.progress = 'same';
    if (/\b(?:it is dry now|its dry now|not sticky anymore|no longer sticky)\b/.test(t)) { evidence.progress = 'dry'; evidence.timing = 'dry'; }
    if (/\b(?:yes.*(?:heav|puddl)|pooled|puddled|puddling|heavy spots)\b/.test(t) && !/\b(?:no|not|without) (?:puddles|puddling|puddled)\b/.test(t)) evidence.haze = 'pooled';
    if (/\b(?:even thin coats|no puddling|no puddles)\b/.test(t)) evidence.haze = 'even';
    if (/\b(?:added (?:some )?water|put water|extra water|added (?:a )?solvent)\b/.test(t) && !/\b(?:not|never|didnt|did not) (?:add|added)\b/.test(t)) evidence.addedLiquid = true;
    if (/\b(?:active leak|water (?:is )?coming through|leaking)\b/.test(risk)) evidence.leak = true;
    // A plain yes/no has meaning only in the context of the last question.
    if (check && /^(?:yes|yes it was|yes it is|yep|correct|no|nope)[.! ]*$/.test(t)) {
      const yes = !/^no/.test(t);
      if (check === 'recipe') evidence.recipe = yes ? 'correct' : 'wrong';
      if (check === 'haze') evidence.haze = yes ? 'pooled' : 'even';
      if (check === 'primer') evidence.primer = yes ? 'tacky' : 'dry';
    }
  });
  for (const check of evidence.unresolved) {
    if (check !== 'surface' && evidence[check] !== undefined && !(check === 'product' && evidence.product === 'sealer')) evidence.unresolved.delete(check);
  }
  return evidence;
}
