import type { AssistantCitation, ConversationMessage } from '@/database/schema/conversations';
import { TECHNICAL_DOC_PAGES } from '../../knowledge/technical-docs';
import { extractJobContext, startsNewJob, type AssistantJobContext } from './job-context';
import { answersCheck, CHECKS, collectTroubleEvidence, isUncertain, normalizeTroubleText as normalize, previousCheck, wantsCheckHelp, wantsNext, type Check, type Trouble } from './instructor-evidence';

export interface InstructorAnswer {
  content: string;
  quickReplies?: string[];
  suggestedFollowUps?: string[];
  citations?: AssistantCitation[];
}

const SIP = 'doc-open-sip-manual-master-copy-v2019-3-2';
const SUMMARY = 'Help me summarize this for my dealer';
const RESET = /\b(?:new|different|another|separate) (?:job|project|site)\b|\bstart (?:over|fresh)\b/i;
const resetsJob = (text: string) => startsNewJob(text) || RESET.test(text);

function shouldYieldToOtherRoute(text: string): boolean {
  const t = normalize(text);
  if (wantsNext(t) || wantsCheckHelp(t)) return false;
  if (/\b(?:can you|could you|please)\b/.test(t) && /\b(?:look at|check|analyse|analyze|see)\b/.test(t) && /\b(?:photo|picture|image)\b/.test(t)) return true;
  const report = /\b(?:is|are|still|keeps?|started|getting)\s+(?:(?:now|still|already)\s+)?(?:peeling|lifting|flaking|cracking|bubbling|blistering|sticky|tacky|soft|not drying|coming off|too (?:thick|thin|runny|stiff))\b/.test(t)
    || /\b(?:wont (?:dry|cure|stick|bond)|water (?:is )?coming through|crack (?:is )?(?:growing|widening)|(?:natural shield|satin(?: stone)?|titan(?: gloss)?|matte|sealer).*(?:cloudy|hazy|milky))\b/.test(t);
  if (report) return false;
  return /\b(?:calculate|coverage|how many|how much|price|priced|cost|promotion|promo|free tools|tool kit|samples?|material(?:s)? (?:do|will|list|estimate|required)|what materials?|which materials?|estimate|quote|difference between|compare|video|youtube)\b/.test(t)
    || /\b(?:what is|what does|how (?:do i|should i|can i|to) (?:install|prepare|apply|waterproof|seal|mix|clean|protect|avoid|prevent))\b/.test(t)
    || /\b(?:place|create|send|buy)\b.*\b(?:order|material request)\b/.test(t);
}

function detectTrouble(text: string): Trouble | undefined {
  const t = normalize(text);
  if (shouldYieldToOtherRoute(text)) return undefined;
  if (/\b(?:prevent|avoid)\b/.test(t) && !/\b(?:already|started|happening|have|has|getting)\b/.test(t)) return undefined;
  const rules: [Trouble, RegExp][] = [
    ['peeling', /\b(?:peel(?:ing|s|ed)?|lift(?:ing|s|ed)?|flak(?:ing|es)|delaminat\w*|not (?:sticking|bonding)|wont (?:stick|bond)|coming (?:off|away))\b/],
    ['cracks', /\b(?:crack(?:ing|s|ed)?|split(?:ting|s)?)\b/],
    ['bubbles', /\b(?:bubbl\w*|blister\w*|pinholes?|pin holes|tiny holes)\b/],
    ['colour', /\b(?:colour|color|shade)\b.*\b(?:uneven|different|wrong|patchy|blotchy|mismatch)\b|\b(?:uneven|different|wrong|patchy|blotchy)\b.*\b(?:colour|color|shade)\b|\b(?:white haze|hazing|cloudy sealer)\b|\b(?:natural shield|satin(?: stone)?|titan(?: gloss)?|matte|sealer)\b.*\b(?:cloudy|milky|hazy)\b/],
    ['drying', /\b(?:sticky|tacky|soft|slow drying|not drying|wont dry|not curing|wont cure|still wet)\b/],
    ['mix', /\b(?:mix|mixture|batch)\b.*\b(?:thick|thin|runny|stiff|lumpy|watery|setting|harden)\w*\b|\b(?:too thick|too thin|too runny|too stiff)\b/],
  ];
  const affirmative = t.replace(/\b(?:no|not|isnt|arent|without)\s+(?:any\s+)?(?:cracks?|cracking|peeling|lifting|bubbles?|blisters?|pinholes?|sticky|tacky|soft)\b/g, '');
  return rules.find(([, pattern]) => pattern.test(affirmative))?.[0];
}

function citations(...pages: number[]): AssistantCitation[] {
  return [...new Set(pages)].flatMap((pageNumber) => {
    const page = TECHNICAL_DOC_PAGES.find((item) => item.docId === SIP && item.pageNumber === pageNumber);
    return page ? [{ id: page.id, documentName: page.sourceDocument, title: page.title, pageNumber, docId: page.docId, retrieval: 'local' as const }] : [];
  });
}

function answer(content: string, quickReplies: string[] = [], pages: number[] = []): InstructorAnswer {
  return { content, quickReplies, citations: citations(...pages) };
}

function handoff(detail: string, pages: number[] = []): InstructorAnswer {
  return answer(`${detail}\n\nSave a close-up, a wider photo and the product/batch details for your SEMCO dealer or on-site reviewer. I can help organize those facts, but cannot inspect photos or approve a warranty repair.`, [SUMMARY, 'Start a new job'], pages);
}

function isReplyChoice(text: string, previous: ConversationMessage | undefined): boolean {
  return previous?.provider === 'local-instructor' && [...(previous.quickReplies ?? []), ...(previous.suggestedFollowUps ?? [])].some((reply) => normalize(reply) === normalize(text));
}

function continuesEpisode(text: string, previous: ConversationMessage | undefined): boolean {
  if (previous?.provider !== 'local-instructor' || shouldYieldToOtherRoute(text)) return false;
  return isReplyChoice(text, previous) || text.trim().split(/\s+/).length <= 75;
}

/** Free, saved-chat-compatible field coaching. Only the installer's words are evidence. */
export function buildInstructorAnswer(userMessage: string, history: ConversationMessage[], jobContext?: AssistantJobContext): InstructorAnswer | null {
  const messages = [...history];
  if (messages.at(-1)?.role === 'user' && messages.at(-1)?.content === userMessage) messages.pop();
  let start = 0;
  messages.forEach((item, index) => { if (item.role === 'user' && resetsJob(item.content)) start = index; });
  const resetNow = resetsJob(userMessage);
  const activeHistory = resetNow ? [] : messages.slice(start);
  const previous = activeHistory.at(-1);
  let priorIssue: Trouble | undefined;
  let episodeStart = 0;
  activeHistory.forEach((item, index) => {
    if (item.role !== 'user') return;
    const prompt = previousCheck(activeHistory[index - 1]);
    const isAnswer = isReplyChoice(item.content, activeHistory[index - 1]) || answersCheck(item.content, prompt);
    const issue = isAnswer && priorIssue ? priorIssue : detectTrouble(item.content);
    if (issue && issue !== priorIssue) { priorIssue = issue; episodeStart = index; }
  });
  const asked = previousCheck(previous);
  const tapped = isReplyChoice(userMessage, previous);
  if (!tapped && shouldYieldToOtherRoute(userMessage)) return null;
  const currentIssue = (tapped || answersCheck(userMessage, asked)) && priorIssue ? priorIssue : detectTrouble(userMessage);
  const issue = currentIssue ?? (continuesEpisode(userMessage, previous) ? priorIssue : undefined);
  if (!issue) return null;
  const episode = currentIssue && currentIssue !== priorIssue ? [] : activeHistory.slice(episodeStart);
  const texts = [...episode.filter((item) => item.role === 'user').map((item) => item.content), userMessage];
  const facts = texts.map(normalize).join('\n');
  const e = collectTroubleEvidence(episode, userMessage);
  const context = resetNow ? extractJobContext([], userMessage) : (jobContext ?? extractJobContext(activeHistory, userMessage));
  const knownSurface = context.substrate !== 'unknown' || /\b(?:paint|epoxy|old coating|plaster|board underneath)\b/.test(facts);
  const isNext = wantsNext(userMessage);
  const alreadySaid = (phrase: string) => episode.some((item) => item.role === 'assistant' && item.content.includes(phrase));
  const ask = (check: Check, intro = '', pages: number[] = []): InstructorAnswer | null => {
    if (e.unresolved.has(check)) return null;
    const prompt = CHECKS[check];
    return answer(`${intro ? `${intro}\n\n` : ''}${prompt.question}\n\nYou can describe it in your own words.`, prompt.choices, pages);
  };

  if (/\b(?:summari[sz]e|tell my dealer|send my dealer|dealer summary)\b/.test(normalize(userMessage))) {
    const labels: Record<Trouble, string> = { peeling: 'Lifting or peeling', cracks: 'Cracking', bubbles: 'Bubbles or holes', colour: 'Uneven colour or haze', drying: 'Slow drying or stickiness', mix: 'Mix consistency' };
    return answer(`Here is a draft you can copy to your SEMCO dealer. Nothing has been sent.\n\nIssue: ${labels[issue]}.\n${context.substrate !== 'unknown' ? `Surface: ${context.substrate.replace(/_/g, ' ')}.\n` : ''}Installer observations:\n${texts.slice(0, -1).map((text) => `- ${text}`).join('\n')}\n\nPlease review the cause and approved repair before we continue. I will provide project photos, the product label and batch details.`, ['Start a new job']);
  }
  if (e.leak || e.movement === 'moving') return handoff('Pause coating in that area. Water coming through or a surface that is moving needs an on-site check before a surface repair is chosen. Keep people clear of a moving or unsafe surface, protect the work from further use, and record where the water or movement is happening. Extra finish, sealer or fabric alone is not a confirmed fix.', [28]);

  if (asked && (isUncertain(userMessage) || wantsCheckHelp(userMessage))) {
    if (!previous?.content.startsWith('Here is an easy way to check')) {
      return answer(`Here is an easy way to check—no need to guess.\n\n${CHECKS[asked].help}\n\nTell me what you notice, or say you still cannot tell. We can keep that detail marked as unknown and work with the other facts.`, CHECKS[asked].choices, asked === 'mixSpeed' ? [27, 31] : []);
    }
  }
  // "Checked" does not silently become a positive result. Move on without
  // asking the exact same question, keeping its outcome explicitly unknown.
  if (asked && isNext) e.unresolved.add(asked);

  if (issue === 'peeling') {
    if (!e.timing) { const r = ask('timing', 'Let’s narrow it down. Pause coating the affected area so the problem does not get buried. Lifting during application and peeling after drying point us to different checks.'); if (r) return r; }
    if (!knownSurface) { const r = ask('surface'); if (r) return r; }
    if (!e.product) { const r = ask('product', 'Thanks—that gives us the surface and timing. Now let’s identify the layer that is letting go.'); if (r) return r; }
    if (!e.layer && !e.cleanliness) { const r = ask('layer', e.primer === 'dry' ? 'The X-Bond procedure calls for applying while it is still tacky, not after the primer dries. This does not prove the cause by itself. Have the failed area reviewed first; fresh primer over loose material is not a repair. Next, look at a piece already loose—do not pull up sound material.' : 'Look at a piece that has already come loose—do not pull up sound material.', e.primer === 'dry' ? [27, 35] : []); if (r) return r; }
    if (e.product === 'x_bond' && !e.primer) {
      const intro = e.cleanliness === 'dust' ? 'Dust or a loose old layer is a useful clue: X-Bond needs a clean, sound surface to bond to. Do not hide it with another coat. We can also check the primer timing before deciding what the dealer needs to review.' : e.layer === 'top' ? 'If the lower layers stay in place, that narrows the check to the bond beneath the top layer—not automatically the whole system.' : 'When several layers lift together, the exposed base and the priming step are useful clues. That still does not prove the cause.';
      const r = ask('primer', intro, [15, 27]); if (r) return r;
    }
    if (!e.cleanliness) { const r = ask('cleanliness', e.primer === 'dry' ? 'The X-Bond procedure calls for placing the mix while the primer is still tacky. Letting it dry is a clue worth recording, but does not prove it is the only cause.' : 'Next, check what the loose layer was attached to.', [15, 27]); if (r) return r; }
    if (isNext && alreadySaid('Here is the practical plan')) return handoff('We have done the safe visual and process checks. Keep the failed patch separate from sound work. The remaining decision is which failed material must be removed and how to rebuild that exact layer; text alone cannot establish the repair boundary. Take the preparation record, primer timing and exposed-layer observations with your photos.', [15, 27]);
    const primer = e.primer === 'dry' ? 'Your dry-primer observation is important: X-Bond goes onto X-Bond Liquid while it is still tacky, not after the primer dries. Fresh primer over the failed coat will not restore its bond. Have the failed area reviewed first.' : e.primer === 'none' ? 'The X-Bond procedure includes an X-Bond Liquid primer coat. Missing it is worth reviewing; it is not a reason to pour primer over loose material.' : '';
    const base = e.cleanliness === 'dust' ? 'A dusty or loose base cannot be made sound just by covering it. The preparation needs to leave a clean, sound surface; keep an already-loose piece and note what is attached to its underside.' : e.cleanliness === 'residue' ? 'Record the old coating or residue. The cleaning/preparation method must match it; do not try a stronger chemical or sand an unknown old coating as an experiment.' : 'Keep the exposed patch clean and avoid damaging sound material while the failed layer is identified.';
    return answer(`Here is the practical plan from what you have told me.\n\n1. Stop adding material to the affected patch.\n2. ${base}\n3. ${primer || 'Record the product, the preparation steps and whether the loose piece carries one layer or several.'}\n4. Before restarting, have the dealer confirm the failed-layer repair, then use a small checked area to verify the preparation and application before covering the rest.\n\nThese checks narrow the cause; they do not guarantee a repair or require the entire job to be removed.`, ['What is the next step?', SUMMARY], [15, 27]);
  }

  if (issue === 'cracks') {
    if (!knownSurface) { const r = ask('surface', 'Let’s see what the crack is following before choosing a repair.'); if (r) return r; }
    if (!e.width) { const r = ask('width', 'The width helps match the measured crack or sheet joint to the right detail.'); if (r) return r; }
    if (!e.movement) { const r = ask('movement', 'Now check whether it is changing. A stable-looking crack is not proof that movement has stopped.'); if (r) return r; }
    if (!e.location) { const r = ask('location', 'The location is another useful clue for choosing the correct detail.'); if (r) return r; }
    if (e.location === 'joint') return answer('Treat that as a joint-detail question, not just a blemish. An intentional movement joint needs to keep doing its job; do not simply bridge or bury it under finish. Mark it on the project plan and check the specified joint detail before repairing the coating around it.\n\nYou have already given the crack size and movement observation, so keep those with the joint location and a ruler photo. Your dealer or the project designer needs that information to confirm the detail.', [SUMMARY], [28]);
    if (isNext && alreadySaid('There are two separate jobs here')) return handoff('The next decision is the exact repair detail for this substrate and measured width. If this is an existing finished surface, the extent of opening/removal cannot be judged in this text chat. Keep the width photo, seam layout and movement observations together so the detail can be confirmed without starting the questioning over.', [28]);
    const seam = e.location === 'seam' ? 'At a sheet seam, first check the specified board/wood joint and reinforcement detail. Fabric must be embedded in Liquid Membrane where the system calls for it—not laid dry with a finish coat over it. A narrow crack does not by itself prove that a sheet joint is sound.' : 'The SIP manual separates fine fractures, medium cracks and larger openings. The repair uses Liquid Membrane, with filling and fabric for the wider details where specified. Do not treat every crack with the same strip of fabric.';
    return answer(`There are two separate jobs here: deal with the cause of the crack, then rebuild the surface using the correct detail.\n\n${seam}\n\nFor now, record the widest measurement, photograph it with a ruler, and identify any matching seam or joint. Keep that area out of the next finish coat until the detail is confirmed. A stable-looking crack is not proof that movement has stopped. The crack-control treatment reduces the chance of a repeat; it is not a guarantee against movement.`, ['What is the next step?', SUMMARY], e.location === 'seam' && context.substrate === 'plywood_osb' ? [24, 28] : [28]);
  }

  if (issue === 'bubbles') {
    if (!e.product) { const r = ask('product', 'Let’s identify the layer first; a hole in waterproofing is different from air in the stone finish.'); if (r) return r; }
    if (!e.timing) { const r = ask('timing', 'The layer’s present condition matters more than when it was applied.'); if (r) return r; }
    if (!e.shape) { const r = ask('shape'); if (r) return r; }
    if (e.shape === 'blisters') return handoff('Raised blisters are different from open pinholes. Do not pop them, sand them or coat over them. Note whether they appeared while wet or after drying and whether surrounding material is loose. A blister can involve a bond or moisture problem; sealing its top does not fix the layer underneath.', [29]);
    if (e.product === 'membrane' && e.shape === 'holes' && e.timing === 'dry') {
      if (/\b(?:reopened|came back|opened again|keep (?:opening|appearing)|still there after)\b/.test(normalize(userMessage)) && alreadySaid('additional Liquid Membrane to close the defects')) return handoff('The holes returning after treatment changes the next step. Stop repeating the patch or covering the membrane. Record where they return and whether the layer is loose, blistered or letting water through. The base, membrane bond and application need review before another repair is selected.', [29]);
      if (isNext && alreadySaid('additional Liquid Membrane to close the defects')) return answer('After the defect treatment has dried to the touch, check the whole membrane again—not just the holes you first noticed. Look across it with a light for missed pinholes, gaps, thin areas and incomplete coverage at edges and penetrations.\n\nKeep the waterproofing and reinforcement requirements for this project unchanged. A visually closed hole is only one check; follow the approved system’s thickness, cure and any required water-test steps before covering or putting it into use. If holes reopen, blisters appear or water comes through, pause and have that condition reviewed.', ['The holes reopened', SUMMARY], [29]);
      return answer('For tiny pinholes in an otherwise sound, dry-to-the-touch Liquid Membrane layer, the SIP procedure says to use additional Liquid Membrane to close the defects. Inspect the whole layer for missed holes, gaps and thin spots before continuing.\n\nDo not use this pinhole fix for raised blisters or loose membrane. Closing visible holes alone does not confirm that the waterproofing meets the project requirements; keep the specified system build and readiness checks.', ['What is the next step?', 'There are raised blisters', SUMMARY], [29]);
    }
    if (e.product === 'membrane' && e.timing === 'wet') return answer('Let that layer reach the dry-to-touch inspection stage before trying to fill what look like holes. While it is wet, keep traffic and debris off it; do not keep rolling it just to chase every mark.\n\nOnce it is dry to the touch, check whether these are open holes or raised blisters. Tiny holes in sound membrane have a documented correction; blisters or loose areas need a different review. Dealer help is needed if there is a leak or loss of bond, not simply because you spotted a wet pinhole.', ['It is dry now, tiny open holes', 'There are raised blisters'], [29]);
    if (e.product === 'x_bond') {
      if (!e.cleanliness) { const r = ask('cleanliness', 'The SIP procedure links a clean, debris-free dry base with avoiding bubbles. Start with that check—not another coat.', [27]); if (r) return r; }
      if (!e.mixSpeed) { const r = ask('mixSpeed', 'The other useful check is air introduced during mixing.', [27, 31]); if (r) return r; }
      return answer(`For the next correctly prepared test area, use a dry base cleared of loose particles and mix with the square paddle at low speed, 180–200 RPM. ${e.mixSpeed === 'fast' ? 'Your fast-mixing observation is a plausible source of trapped air, but it does not prove the cause of every mark.' : 'You have already checked the base and mixing method, so I will not ask those again.'}\n\nKeep existing raised, loose or recurring defects out of the next coat. Their repair must be checked separately; changing the mixer setting prevents added air in a new batch but does not re-bond a failed surface. Record whether the holes appeared immediately or only as it dried for that review.`, [SUMMARY], [27, 31]);
    }
    return answer('Do not add another sealer coat just to cover the marks. Keep the area protected and note whether the marks are holes or raised blisters, plus the exact sealer and application time. For the next test area, check the product-specific mixing and roller/spray method; air introduced during mixing and a loose underlying layer need different responses.\n\nI do not have a verified universal repair for every sealer. The useful next step is matching this exact sealer and observed defect to its repair guidance, rather than borrowing a membrane pinhole fix.', [SUMMARY]);
  }

  if (issue === 'colour') {
    const haze = /\b(?:white haze|hazing|cloudy|milky|hazy)\b/.test(facts);
    if (haze && (!e.product || e.product === 'sealer')) return e.unresolved.has('product') ? answer('The sealer name is still unknown, so keep the area protected and do not add cleaner, tint or another sealer as an experiment. Compare photos from before and after sealing, and check the application time and where the haze is strongest. Those observations are useful now; the pail label or invoice is needed before product-specific repair instructions. Type the name here when you find it.', [SUMMARY]) : answer('Which exact sealer is cloudy? The name on the pail matters because the products dry and behave differently. You can type the name.', ['Natural Shield looks cloudy', 'Satin Stone looks cloudy', 'Matte sealer looks cloudy', 'I am not sure which sealer']);
    if (haze && e.product === 'natural') {
      if (!e.haze) { const r = ask('haze', 'Natural Shield has a specific warning against puddling because a heavy pool can leave a white haze. That is one possible explanation, not a diagnosis.', [40]); if (r) return r; }
      return answer(`For Natural Shield, compare the hazy areas with the coat pattern. ${e.haze === 'pooled' ? 'Your observation that the marks follow heavier areas fits the manual’s puddling warning.' : 'If the coats were thin and even, do not assume puddling is the cause; record the coat timing and conditions too.'}\n\nDo not add tint, cleaner or more sealer to hide dried haze. Photograph the pattern and check the application record: Natural Shield’s specified coats go wet-on-wet without puddles. Dried haze needs product-specific repair advice; the wet-on-wet instruction is for correct application, not permission to flood a failed coat.`, [SUMMARY], [40]);
    }
    if (!e.sealed) { const r = ask('sealed', 'Let’s compare like with like before changing the colour.'); if (r) return r; }
    if (!e.batches) { const r = ask('batches'); if (r) return r; }
    if (isNext && alreadySaid('Compare the fully dried finish')) return answer('Use the batch boundary as a clue. If the shade changes at the start of a new bucket, compare that bucket’s colour formula, pigment amount and measured X-Bond Liquid amount. If one bucket has light and dark areas, compare texture, coat thickness and lighting first.\n\nKeep a labelled sample from each batch, and compare all samples at the same drying stage. If the measured records match but the difference remains, take those samples and photos to your dealer before any colour correction. Do not add pigment by eye or spot-seal the installed surface.', [SUMMARY], [6, 33]);
    return answer('Compare the fully dried finish with the approved sample under the same lighting. A difference is not automatically a pigment mistake.\n\n1. Check the colour formula and measured X-Bond Liquid amounts for each batch.\n2. Compare where a new bucket started with the edges of the colour change.\n3. Look at texture and thickness: a hand-trowelled high spot can catch light differently from a low spot.\n4. Compare surfaces at the same stage—unsealed with unsealed, finished with finished.\n\nDo not add extra pigment or spot-seal to chase the shade. If these checks do not explain it, the batch records and approved sample give your dealer something specific to assess.', ['What is the next step?', SUMMARY], [6, 33]);
  }

  if (issue === 'drying') {
    if (!e.product || e.product === 'sealer') return e.unresolved.has('product') ? answer('The product is still unknown, so I will not give you another product’s cure time. Keep the area out of use, do not add a coat or force heat, and record the application time and room conditions. Check the pail label or material invoice when available; type that product name here and we can match the next check to it.', [SUMMARY]) : answer('What exact product is still sticky or soft? Check the pail name; each product has its own drying rules.', ['X-Bond is still soft', 'Liquid Membrane is still tacky', 'Satin Stone is sticky', 'Matte sealer is sticky']);
    if (!e.elapsed) { const r = ask('elapsed', 'Keep the area out of use and do not add another coat yet.'); if (r) return r; }
    if (!e.climate) { const r = ask('climate', 'Thanks—I have the application time. Cold or damp conditions can slow drying, so this is the next useful check.'); if (r) return r; }
    if (e.product === 'matte' && !alreadySaid('Matte-specific')) return answer('I do not have enough verified Matte-specific drying and repair information to give you a safe waiting time. Do not borrow another sealer’s cure time.\n\nYou can still make useful progress: keep the area protected, record the temperature/humidity and coat time, and compare whether it is steadily firming up or staying equally sticky. Avoid forced heat, cleaners or another coat as a guessed fix. The current Matte sheet or dealer needs to confirm readiness if it remains soft.', CHECKS.progress.choices);
    if (e.product === 'satin' && !e.recipe) { const r = ask('recipe', 'For Satin Stone, the SIP procedure requires two parts A to one part B, thoroughly mixed at low speed, with the batch time marked. The mix can remain liquid in the bucket even after its working time, so appearance in the bucket is not a usability test.', [45]); if (r) return r; }
    if (e.recipe === 'wrong') return handoff('A confirmed wrong A/B mix is not simply slow drying. Keep the area out of use and the remaining batch separate. Write down the exact amounts of A and B and the batch time. Do not add hardener onto the surface or cover it with another coat; the mixed material and installed area need the product-specific repair decision.', [45]);
    if (!e.progress) { const r = ask('progress', 'Dry-to-touch is not the same as ready for the next coat, foot traffic or water exposure. Compare the condition over time without marking the finish.', e.product === 'satin' ? [45] : []); if (r) return r; }
    if (e.progress === 'same') return handoff('You have checked the product, elapsed time and conditions, and it is not improving. That is more useful than simply waiting an arbitrary number of hours. Keep it out of use and note coat thickness and batch measurements; the dealer should compare those with the current product sheet before deciding whether more time or a repair is needed. Do not force-dry it or add another coat.', e.product === 'satin' ? [45] : []);
    return answer(e.progress === 'dry' ? 'Good—that is a change in condition, not automatic clearance to use the area. Check the next milestone for this exact product: recoat, foot traffic, cleaning and water exposure can have different requirements. Keep the elapsed-time and condition notes with the project, and use the current product sheet for that milestone. Do not substitute another product’s cure time.' : 'If it is steadily becoming firmer, keep the surface protected and allow the product’s specified drying conditions to continue. Record the progress rather than repeatedly touching or walking on it.\n\nBefore the next coat or use, check that exact product’s readiness requirements—not just a dry surface skin. If it stops improving, remains soft beyond its product guidance, blisters or loses bond, pause for a batch/condition review.', ['No improvement', 'It is dry now', SUMMARY], e.product === 'satin' ? [45] : []);
  }

  if (!e.product || !['x_bond', 'microbond'].includes(e.product)) { const r = ask('product', 'First, let’s identify the product you are mixing. I will match the recipe to that product, then the coat.'); if (r) return r; }
  if (e.stage === 'brown') return answer('A brown or levelling coat is a different mix from the scratch and finish coats, including a separate additive where specified. Do not correct it using a floor-finish or wall-finish ratio. Keep this batch separate and compare the actual X-Bond Liquid, X-Bond Additive and Stone quantities with the brown-coat detail for your substrate and build-up.', [SUMMARY], [30]);
  if (!e.stage) { const r = ask('stage'); if (r) return r; }
  if (!e.product || !['x_bond', 'microbond'].includes(e.product) || !e.stage) return answer('The product or coat is still unconfirmed, so I will not give you a guessed recipe. Check the bag/pail names and whether this is a bonding, finish or levelling coat. Keep the batch separate in the meantime, and do not add water or powder by eye. Once you have the label and coat type, type them here and we can continue.', ['X-Bond floor scratch coat', 'X-Bond floor finish', 'X-Bond wall finish', 'MicroBond finish']);
  if (e.recipe === 'wrong' || e.addedLiquid) return handoff(`${e.recipe === 'wrong' ? 'Keep that batch separate and do not use it yet.' : 'Set that batch aside; another liquid has changed the measured recipe.'} Write down the actual products and quantities, including any added water or solvent. That lets the dealer decide whether a correction is possible. Do not keep adding more by eye; a fresh correctly measured batch avoids carrying an unknown recipe into the job.`, [27, 33, 35]);
  if (!e.mixWhen) { const r = ask('mixWhen'); if (r) return r; }
  if (e.mixWhen === 'stood') return answer('If the mix thickened while sitting, do not restore it by adding liquid by eye. Set it aside and record the batch age, temperature and original measures. Only the product’s working-time guidance can establish whether that batch is still usable.\n\nFor the next batch, measure the correct recipe, mix only what you can place within the working time, and have the surface and tools ready before mixing. That improves the workflow without gambling on an old bucket. Have the dealer review the held batch if you want to know whether it can be used.', [SUMMARY], [27, 33, 35]);
  const ratio = e.product === 'microbond' ? 'one measure of X-Bond Liquid to two measures of MicroBond Stone' : e.stage === 'scratch' ? 'one measure of X-Bond Liquid to two measures of X-Bond Stone' : e.stage === 'wall' ? 'one measure of X-Bond Liquid to three measures of X-Bond Stone' : 'one measure of X-Bond Liquid to two and a half measures of X-Bond Stone';
  const page = e.stage === 'scratch' ? 27 : e.stage === 'wall' || e.product === 'microbond' ? 35 : 33;
  if (!e.recipe) { const r = ask('recipe', `Check the measured recipe first: for this ${e.product === 'microbond' ? 'MicroBond finish' : `${e.stage} coat`}, the SIP procedure is ${ratio}, using the same measure throughout. Put the liquid in first, then the powder, and mix slowly with the square paddle.`, [page]); if (r) return r; }
  if (!e.mixSpeed) { const r = ask('mixSpeed', 'Keep the measured recipe in your batch notes. Next check the mixing method—not another adjustment to the recipe.', [page]); if (r) return r; }
  return answer(`${e.unresolved.size ? 'Some checks remain unconfirmed, so this is preparation for a new test batch—not approval of the current batch.' : 'You have now checked the product, coat, measured recipe and mixing method.'} For the next small test batch, use clean measuring containers, liquid first, then powder, and the square paddle at low speed. Look for lumps or moisture damage in the powder before using it; do not assume more liquid will solve them.\n\nIf a fresh correctly measured batch is still unsuitable, stop changing the recipe. Keep the bag/pail labels, lot numbers and exact measures so the dealer can review the material itself. This is a specific product check, not another round of the same questions.`, [SUMMARY], [page]);
}
