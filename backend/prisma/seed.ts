import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// DDragon base URL — version pinned; update when patch changes
const DD = 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion'

type Option = { id: string; text: string }
type QuestionInput = {
  type: string
  lane: string
  text: string
  hint?: string
  options: Option[]
  correctAnswer: string
  explanation: string
}

const questions: QuestionInput[] = [
  // ── TOP ──────────────────────────────────────────────────────────────────
  {
    type: 'scenario',
    lane: 'top',
    text: 'It\'s minute 4 and your jungler is coming for a top-side gank. Your opponent is pushed to your tower. What do you do?',
    hint: 'Think about wave positioning and CC.',
    options: [
      { id: 'A', text: 'Push the wave hard to deny plates' },
      { id: 'B', text: 'Use any CC you have and follow up on the gank' },
      { id: 'C', text: 'Back off to let the jungler solo the gank' },
      { id: 'D', text: 'Recall to buy before the gank lands' },
    ],
    correctAnswer: 'B',
    explanation: 'When your jungler ganks and the enemy is pushed up, your job is to use your CC and follow damage. Pushing the wave wastes the gank window; backing off gives the enemy time to escape.',
  },
  {
    type: 'scenario',
    lane: 'top',
    text: 'You are 3/0 as a split-push champion at 15 minutes. Your team is losing teamfights 0/6. What is the correct macro play?',
    hint: 'Map pressure vs teamfight — which wins faster?',
    options: [
      { id: 'A', text: 'Group mid and force teamfights with your lead' },
      { id: 'B', text: 'Continue split-pushing and force a 1-3-1 rotation' },
      { id: 'C', text: 'Ask your team to surrender' },
      { id: 'D', text: 'Camp baron and wait for your team to recover' },
    ],
    correctAnswer: 'B',
    explanation: 'A fed split-pusher creates map pressure that forces the enemy to send 2+ players, giving your team a numbers advantage in another lane. A 1-3-1 or split-push threat is more reliable than grouping with teammates who are losing teamfights.',
  },
  {
    type: 'blitz',
    lane: 'top',
    text: 'What is the primary weakness of most tank top laners in the early game?',
    options: [
      { id: 'A', text: 'Low base damage before items' },
      { id: 'B', text: 'No crowd control' },
      { id: 'C', text: 'Extremely long cooldowns' },
      { id: 'D', text: 'No engage range' },
    ],
    correctAnswer: 'A',
    explanation: 'Tanks rely on items to deal meaningful damage. Pre-items in early levels, they can absorb pressure but cannot punish effectively, making them vulnerable to poke-focused matchups.',
  },
  {
    type: 'blitz',
    lane: 'top',
    text: 'When should you take Teleport over Ignite as a top laner?',
    options: [
      { id: 'A', text: 'When you plan to all-in your opponent before level 6' },
      { id: 'B', text: 'When your champion has strong global presence and the game requires macro impact' },
      { id: 'C', text: 'When your jungler runs Ignite' },
      { id: 'D', text: 'Ignite is always better in top lane' },
    ],
    correctAnswer: 'B',
    explanation: 'Teleport allows you to impact bot-lane dives, join mid-game teamfights, and reset after trading. It shines on champions who scale and want to influence the map, whereas Ignite is better for lane-dominant, early-kill champions.',
  },
  {
    type: 'trivia',
    lane: 'top',
    text: 'Which item is considered core on most split-push melee top laners because it provides damage, speed, and tower-taking ability?',
    options: [
      { id: 'A', text: 'Trinity Force' },
      { id: 'B', text: 'Sunfire Aegis' },
      { id: 'C', text: 'Ravenous Hydra' },
      { id: 'D', text: 'Heartsteel' },
    ],
    correctAnswer: 'A',
    explanation: 'Trinity Force provides Spellblade (a powerful auto-attack proc), movement speed on kills, and attack speed — all ideal for melee champions who want to split-push, take towers fast, and duel opponents.',
  },
  {
    type: 'trivia',
    lane: 'top',
    text: 'What does "freezing" the wave mean in top lane?',
    options: [
      { id: 'A', text: 'Pushing the wave under tower as fast as possible' },
      { id: 'B', text: 'Maintaining the wave just in front of your tower so the enemy must overextend to farm' },
      { id: 'C', text: 'Using Glacial Augment to slow the enemy' },
      { id: 'D', text: 'Killing the wave at the exact same rate as your opponent' },
    ],
    correctAnswer: 'B',
    explanation: 'Freezing means maintaining 3+ more enemy minions than your own so the wave stays near your tower. This denies the enemy safe CS, sets up jungler ganks, and forces them to overextend or lose gold.',
  },

  // ── JUNGLE ───────────────────────────────────────────────────────────────
  {
    type: 'scenario',
    lane: 'jungle',
    text: 'You clear your first full clear and have 3/4 HP remaining. Both solo laners need ganks. Bot lane has a 2v2 fight starting. What do you do?',
    hint: 'Prioritize tempo and win conditions.',
    options: [
      { id: 'A', text: 'Recall and buy then decide' },
      { id: 'B', text: 'Gank the solo lane that has priority (enemy pushed in)' },
      { id: 'C', text: 'Secure scuttle crab closest to you then evaluate' },
      { id: 'D', text: 'Invade the enemy jungle for their second buff' },
    ],
    correctAnswer: 'C',
    explanation: 'Scuttle crab provides vision, slow zones for ganks, and river control. Securing it before deciding your next move is almost always correct unless a lane is immediately winning a fight you can 100% convert.',
  },
  {
    type: 'scenario',
    lane: 'jungle',
    text: 'Dragon spawns in 30 seconds. You have no vision in the dragon pit. The enemy jungler\'s last seen position is top side. What do you do?',
    hint: 'Risk vs reward — vision before committing.',
    options: [
      { id: 'A', text: 'Immediately walk in and start dragon' },
      { id: 'B', text: 'Ward dragon pit from a safe angle and wait for laners to rotate' },
      { id: 'C', text: 'Ignore dragon and farm your jungle' },
      { id: 'D', text: 'Ask mid to solo dragon for you' },
    ],
    correctAnswer: 'B',
    explanation: 'Walking blindly into dragon pit risks getting caught in a 5v1 ambush. Vision control is mandatory before contesting objectives. Waiting for laners and checking sight lines dramatically increases your chances of winning the fight.',
  },
  {
    type: 'blitz',
    lane: 'jungle',
    text: 'What is "counter-jungling" and when is it most effective?',
    options: [
      { id: 'A', text: 'Stealing enemy camps when you know the jungler is on the opposite side of the map' },
      { id: 'B', text: 'Ganking a lane the enemy jungler just failed to gank' },
      { id: 'C', text: 'Taking the enemy red buff at game start' },
      { id: 'D', text: 'Smiting the enemy jungler to death' },
    ],
    correctAnswer: 'A',
    explanation: 'Counter-jungling is most effective when you have vision or information about the enemy jungler\'s location. Taking their camps when they are far away denies gold and XP without risk.',
  },
  {
    type: 'blitz',
    lane: 'jungle',
    text: 'What does "pathing" refer to in jungle strategy?',
    options: [
      { id: 'A', text: 'The route a jungler takes to clear their camps efficiently' },
      { id: 'B', text: 'Using pathfinding items to move through walls' },
      { id: 'C', text: 'Walking the safest route around the river' },
      { id: 'D', text: 'Smite priority on dragon vs baron' },
    ],
    correctAnswer: 'A',
    explanation: 'Pathing is the planned sequence of jungle camps a jungler clears, designed to maximize XP, gold, and gank windows while ending near objectives or laners who need help.',
  },
  {
    type: 'trivia',
    lane: 'jungle',
    text: 'Which jungle camp, when killed, provides the Smite upgrades (Challenging / Chilling Smite) at certain thresholds?',
    options: [
      { id: 'A', text: 'Gromp' },
      { id: 'B', text: 'Red Brambleback' },
      { id: 'C', text: 'Rift Scuttler' },
      { id: 'D', text: 'Smite upgrades from stacking any monster kills' },
    ],
    correctAnswer: 'D',
    explanation: 'In current League, Smite automatically upgrades to Chilling or Challenging Smite after you accumulate enough large monster kills (tracked by your jungle item). It isn\'t tied to a single specific camp.',
  },
  {
    type: 'trivia',
    lane: 'jungle',
    text: 'What is "leashing" and why do laners do it at game start?',
    options: [
      { id: 'A', text: 'Kiting the first camp for the jungler to start with more HP' },
      { id: 'B', text: 'Warding the enemy jungle entrance' },
      { id: 'C', text: 'Stealing the enemy\'s buff by invading level 1' },
      { id: 'D', text: 'Pulling the wave toward your tower immediately' },
    ],
    correctAnswer: 'A',
    explanation: 'Leashing means laners auto-attack the jungler\'s starting camp (usually Red or Blue buff) to deal free damage so the jungler takes less HP loss. This gives the jungler a healthier start without sacrificing laner experience.',
  },

  // ── MID ──────────────────────────────────────────────────────────────────
  {
    type: 'scenario',
    lane: 'mid',
    text: 'You are playing an assassin mid laner and your wave is pushed in. The enemy top laner has Teleport up and is pushing their wave hard. What is your rotation?',
    hint: 'Assassins threaten carries — not tanks.',
    options: [
      { id: 'A', text: 'Roam bot to look for a pick onto the enemy ADC' },
      { id: 'B', text: 'Stay mid and try to kill the mid laner under tower' },
      { id: 'C', text: 'Roam top to punish the overextension' },
      { id: 'D', text: 'Clear the wave and back to buy items' },
    ],
    correctAnswer: 'A',
    explanation: 'Assassins excel at one-shotting squishy targets. Roaming bot with priority targets (ADC/Support) is higher value than going top where you\'d likely face a tank. The enemy Teleport also means your top laner is at risk if you leave them alone.',
  },
  {
    type: 'scenario',
    lane: 'mid',
    text: 'You win a 1v1 in mid lane at level 7 and your opponent has 30 seconds on their death timer. There is no one rotating. What do you do?',
    hint: 'Use the death timer — turn it into a map advantage.',
    options: [
      { id: 'A', text: 'Push the wave and recall' },
      { id: 'B', text: 'Roam to make a play bot or top while the enemy respawns' },
      { id: 'C', text: 'Invade the enemy mid jungler\'s camps' },
      { id: 'D', text: 'Dive the mid-lane tower immediately' },
    ],
    correctAnswer: 'B',
    explanation: 'A death timer is a window of free pressure. After winning a 1v1, fast-push the wave under the enemy tower, then immediately roam for another kill or objective. The enemy cannot respond from base while dead.',
  },
  {
    type: 'blitz',
    lane: 'mid',
    text: 'What does "wave priority" mean for mid laners?',
    options: [
      { id: 'A', text: 'Having more minions alive in your wave than the enemy' },
      { id: 'B', text: 'Clearing the wave before the enemy so you are free to roam or contest objectives' },
      { id: 'C', text: 'Always pushing the wave to the enemy tower' },
      { id: 'D', text: 'Keeping the minion wave near the center of the lane' },
    ],
    correctAnswer: 'B',
    explanation: 'Wave priority means your minion wave is cleared (or winning the crash) so you have a window to roam, contest dragon/herald, or respond to other lanes without losing CS.',
  },
  {
    type: 'blitz',
    lane: 'mid',
    text: 'Which of the following is the best counter to a mage mid laner who relies on skillshots?',
    options: [
      { id: 'A', text: 'Rushing magic resistance and playing unpredictably' },
      { id: 'B', text: 'Standing still to bait their abilities' },
      { id: 'C', text: 'Rushing health stacking items' },
      { id: 'D', text: 'Always pushing the wave to deny roams' },
    ],
    correctAnswer: 'A',
    explanation: 'Dodging skillshots with unpredictable movement combined with magic resistance items dramatically reduces the threat of a mage. Early MR buys safety while you wait for your win condition to come online.',
  },
  {
    type: 'trivia',
    lane: 'mid',
    text: 'What term describes the act of a mid laner leaving lane to assist another lane or secure an objective?',
    options: [
      { id: 'A', text: 'Diving' },
      { id: 'B', text: 'Roaming' },
      { id: 'C', text: 'Freezing' },
      { id: 'D', text: 'Splitting' },
    ],
    correctAnswer: 'B',
    explanation: 'Roaming is when a mid laner (or any laner) leaves their lane to impact another part of the map. Mid laners have the shortest path to every lane, making them the most impactful roamers in the game.',
  },
  {
    type: 'trivia',
    lane: 'mid',
    text: 'Which resource, unique to some mid lane mages, regenerates ability power temporarily after casting spells?',
    options: [
      { id: 'A', text: 'Mana' },
      { id: 'B', text: 'Energy' },
      { id: 'C', text: 'Fury' },
      { id: 'D', text: 'Flow (Arcane Comet passive)' },
    ],
    correctAnswer: 'B',
    explanation: 'Energy is a resource used by champions like Zed, Akali, and Kennen. It regenerates quickly, caps at 200, and has no items that increase it — making Energy champions less susceptible to mana harassment.',
  },

  // ── ADC ──────────────────────────────────────────────────────────────────
  {
    type: 'scenario',
    lane: 'adc',
    text: 'Your support engages a 2v2 bot lane at level 3 but you are at 60% HP. The enemy ADC is at 80% HP and their support missed their CC. What do you do?',
    hint: 'Assess the fight math — don\'t just follow blindly.',
    options: [
      { id: 'A', text: 'Commit fully and DPS the enemy ADC down' },
      { id: 'B', text: 'Auto-attack the nearest target and back off if you drop below 40%' },
      { id: 'C', text: 'Immediately disengage since you started the fight at low HP' },
      { id: 'D', text: 'Ignore the fight and push the minion wave' },
    ],
    correctAnswer: 'A',
    explanation: 'If the enemy support missed their CC and your support has engaged on favorable terms, a 60% HP ADC can still win a 2v2. ADC damage in short trades is extremely high — committing and melting the enemy ADC is correct here.',
  },
  {
    type: 'scenario',
    lane: 'adc',
    text: 'It\'s late game. Your team is doing Baron. You are the only one who can burst baron down quickly. The enemy team is approaching with 3 members visible. What do you do?',
    hint: 'Baron timing vs fight decision.',
    options: [
      { id: 'A', text: 'Continue DPSing baron and trust your tank to peel' },
      { id: 'B', text: 'Stop baron and position behind your team for the fight' },
      { id: 'C', text: 'Smite baron and immediately join the fight' },
      { id: 'D', text: 'Disengage and reset baron attempt' },
    ],
    correctAnswer: 'B',
    explanation: 'As an ADC, dying while doing baron is catastrophic. When the enemy collapses, your survivability behind your frontline takes priority. Call for your Smite user to steal/secure and position for the incoming fight.',
  },
  {
    type: 'blitz',
    lane: 'adc',
    text: 'What is "kiting" in the context of an ADC?',
    options: [
      { id: 'A', text: 'Using crowd control to stop enemies from reaching you' },
      { id: 'B', text: 'Moving between auto-attacks to maintain range while dealing damage' },
      { id: 'C', text: 'Staying behind your support at all times' },
      { id: 'D', text: 'Using your ultimate to escape ganks' },
    ],
    correctAnswer: 'B',
    explanation: 'Kiting is the core ADC mechanical skill — moving between auto-attacks toward safety while continuously dealing damage. Proper kiting allows you to kill melee champions who are trying to close the distance.',
  },
  {
    type: 'blitz',
    lane: 'adc',
    text: 'What does "positioning" refer to for ADCs in teamfights?',
    options: [
      { id: 'A', text: 'Standing at maximum auto-attack range, safe from frontline engage' },
      { id: 'B', text: 'Being in the middle of the teamfight to maximise damage' },
      { id: 'C', text: 'Standing on top of your support to receive heals' },
      { id: 'D', text: 'Running ahead of the team to bait the enemy engage' },
    ],
    correctAnswer: 'A',
    explanation: 'ADC positioning means staying at the edge of your auto-attack range, just far enough that enemy front-liners cannot easily reach you. You deal most of your damage through sustained autos, so staying alive is your highest priority.',
  },
  {
    type: 'trivia',
    lane: 'adc',
    text: 'What is the primary stat that ADC players typically stack to enable "crit" builds?',
    options: [
      { id: 'A', text: 'Attack Damage' },
      { id: 'B', text: 'Attack Speed' },
      { id: 'C', text: 'Critical Strike Chance' },
      { id: 'D', text: 'Armor Penetration' },
    ],
    correctAnswer: 'C',
    explanation: 'Critical Strike Chance is the foundation of the traditional ADC build. At 100% crit, every auto-attack crits for 175% AD, scaling exponentially with AD items. Most ADC items are designed around the 60-100% crit breakpoints.',
  },
  {
    type: 'trivia',
    lane: 'adc',
    text: 'Which dragon buff permanently increases the team\'s attack damage and attack speed?',
    options: [
      { id: 'A', text: 'Infernal Drake soul' },
      { id: 'B', text: 'Mountain Drake soul' },
      { id: 'C', text: 'Cloud Drake soul' },
      { id: 'D', text: 'Hextech Drake soul' },
    ],
    correctAnswer: 'A',
    explanation: 'The Infernal Drake soul (and each Infernal buff stack) grants bonus AD and AP, which directly scales ADC auto-attack damage. It is considered the strongest drake soul for sustained DPS carries.',
  },

  // ── SUPPORT ──────────────────────────────────────────────────────────────
  {
    type: 'scenario',
    lane: 'support',
    text: 'You are playing an engage support and you land a hook on the enemy ADC at level 2. Your ADC is farming under a minion wave. What is the ideal follow-up?',
    hint: 'Level 2 all-ins can win lane — but requires ADC cooperation.',
    options: [
      { id: 'A', text: 'Use all your abilities to burst down the hooked target' },
      { id: 'B', text: 'Hold your follow-up CC and ping your ADC to engage' },
      { id: 'C', text: 'Release the target and disengage safely' },
      { id: 'D', text: 'Ward the river bush while holding the target' },
    ],
    correctAnswer: 'A',
    explanation: 'At level 2 with an engage hook, you should commit all resources. The enemy ADC is the kill target — your ADC may or may not follow, but maxing your burst on the isolated target gives the best kill chance.',
  },
  {
    type: 'scenario',
    lane: 'support',
    text: 'Your team is ahead by 8 kills at 20 minutes. You just pushed the bot-lane tower. What should you do as a support with global map impact?',
    options: [
      { id: 'A', text: 'Stay bot and shove the second tower' },
      { id: 'B', text: 'Roam mid or help secure dragon / herald' },
      { id: 'C', text: 'Go back and buy items' },
      { id: 'D', text: 'Follow your ADC wherever they go' },
    ],
    correctAnswer: 'B',
    explanation: 'After a tower falls and you have a lead, the support\'s value is roaming. You enable other winning lanes, help secure objectives, and prevent comebacks. Staying bot and farming the second tower without a fight is wasted impact.',
  },
  {
    type: 'blitz',
    lane: 'support',
    text: 'What is "peeling" and when should a support prioritize it over engaging?',
    options: [
      { id: 'A', text: 'Using CC and positioning to protect your carry from divers in a teamfight' },
      { id: 'B', text: 'Placing wards at key map locations' },
      { id: 'C', text: 'Stealing the enemy ADC\'s farm to deny gold' },
      { id: 'D', text: 'Disengaging a fight that is going badly' },
    ],
    correctAnswer: 'A',
    explanation: 'Peeling means protecting your carries from assassins or divers using shields, heals, slows, and knock-ups. Prioritise peeling when your carry is the primary win condition and the enemy is trying to dive them.',
  },
  {
    type: 'blitz',
    lane: 'support',
    text: 'When is the ideal time to place the first ward as support at game start?',
    options: [
      { id: 'A', text: 'After the first minion wave crashes' },
      { id: 'B', text: 'In the river brush or enemy tri-bush before minions spawn to contest level-1 invades' },
      { id: 'C', text: 'At 2 minutes when scuttle crab spawns' },
      { id: 'D', text: 'After your ADC hits level 2' },
    ],
    correctAnswer: 'B',
    explanation: 'Placing a ward in the river or enemy tri-bush before minions spawn provides vision of enemy level-1 invades, helping your team avoid surprises and potentially winning a 5v5 skirmish with positional advantage.',
  },
  {
    type: 'trivia',
    lane: 'support',
    text: 'Which support item class regenerates mana and generates gold based on using abilities near enemies?',
    options: [
      { id: 'A', text: 'Warden items (Redemption, Locket)' },
      { id: 'B', text: 'Watcher items (Shard of True Ice, Frostfang)' },
      { id: 'C', text: 'Spectral Sickle / Spellthief\'s Edge line' },
      { id: 'D', text: 'Targon\'s Buckler line' },
    ],
    correctAnswer: 'C',
    explanation: 'Spellthief\'s Edge and its upgrades (Frostfang, Shard of True Ice) are designed for poke/mage supports. Gold is generated each time you hit an enemy champion with a spell, incentivising aggressive ability use in lane.',
  },
  {
    type: 'trivia',
    lane: 'support',
    text: 'What vision ward can be placed to permanently reveal an area (until destroyed by the enemy)?',
    options: [
      { id: 'A', text: 'Stealth Ward (Trinket)' },
      { id: 'B', text: 'Control Ward (Pink Ward)' },
      { id: 'C', text: 'Oracle Lens' },
      { id: 'D', text: 'Farsight Alteration' },
    ],
    correctAnswer: 'B',
    explanation: 'Control Wards (purchasable pink wards) provide permanent, un-camouflaged vision in an area. They also reveal and disable invisible wards and traps. Placing one in key bushes (dragon, baron, river) every time you back is essential support play.',
  },

  // ── GENERAL TRIVIA ───────────────────────────────────────────────────────
  {
    type: 'trivia',
    lane: 'top',
    text: 'What is the respawn timer for Baron Nashor?',
    options: [
      { id: 'A', text: '4 minutes' },
      { id: 'B', text: '5 minutes' },
      { id: 'C', text: '6 minutes' },
      { id: 'D', text: '7 minutes' },
    ],
    correctAnswer: 'C',
    explanation: 'Baron Nashor respawns 6 minutes after it is killed. Teams should control vision and contest it every 6-minute cycle. Baron spawns at 20 minutes in the game.',
  },
  {
    type: 'trivia',
    lane: 'jungle',
    text: 'At what game time does Baron Nashor first spawn?',
    options: [
      { id: 'A', text: '15:00' },
      { id: 'B', text: '18:00' },
      { id: 'C', text: '20:00' },
      { id: 'D', text: '25:00' },
    ],
    correctAnswer: 'C',
    explanation: 'Baron Nashor spawns at exactly 20:00. Teams should set up vision around the pit starting around 18-19 minutes to control the objective contest.',
  },
  {
    type: 'trivia',
    lane: 'mid',
    text: 'What does the "Void Grub" objective in early game primarily reward?',
    options: [
      { id: 'A', text: 'Dragon soul stacks' },
      { id: 'B', text: 'Void mites that attack towers, accelerating tower destruction' },
      { id: 'C', text: 'Bonus gold for the entire team' },
      { id: 'D', text: 'A temporary shield for all team members' },
    ],
    correctAnswer: 'B',
    explanation: 'Void Grubs, when killed, grant Void mites that assist in destroying towers. Taking all six Void Grubs creates a powerful tower-destroying threat for the team that secured them.',
  },
  {
    type: 'trivia',
    lane: 'adc',
    text: 'What is the gold bounty for destroying an inhibitor?',
    options: [
      { id: 'A', text: '100 gold split' },
      { id: 'B', text: '150 gold to each team member' },
      { id: 'C', text: '50 gold to the destroyer only' },
      { id: 'D', text: '250 gold to the team' },
    ],
    correctAnswer: 'B',
    explanation: 'Destroying an inhibitor grants 150 gold to every member of the attacking team (750 total), plus it opens the lane for super minions — making inhibitors high-value objectives in the mid-to-late game.',
  },
  {
    type: 'trivia',
    lane: 'support',
    text: 'What is the "Dragon Soul" mechanic?',
    options: [
      { id: 'A', text: 'A permanent team buff earned after killing 4 dragons of the same type' },
      { id: 'B', text: 'A permanent team buff earned after killing the 4th dragon (of any type combination)' },
      { id: 'C', text: 'A one-time power spike given to the player who lands the killing blow on dragon' },
      { id: 'D', text: 'A global passive granted after destroying the dragon pit structure' },
    ],
    correctAnswer: 'B',
    explanation: 'The Dragon Soul is a permanent buff granted when a team secures their 4th elemental dragon (any combination). The Soul type is determined by the majority element, and it significantly amplifies teamfight power.',
  },
]

type ChampionInput = { name: string; lane: string; imageUrl: string }

// All 172 champions from local champions.json, with DDragon IDs
// DDragon ID is the same as our champion id in most cases.
// Lanes mapped from role field: ADC → adc, Support → support, etc.
function laneFromRole(role: string): string {
  switch (role) {
    case 'Top': return 'top'
    case 'Jungle': return 'jungle'
    case 'Mid': return 'mid'
    case 'ADC': return 'adc'
    case 'Support': return 'support'
    default: return 'top'
  }
}

const DDRAGON_VERSION = '14.24.1'
const DD_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion`

// Champion list: [ddId, displayName, role]
// ddId = DDragon file key (used in image URL), displayName = human-readable name
const RAW_CHAMPIONS: [string, string, string][] = [
  ['Aatrox', 'Aatrox', 'Top'],
  ['Ahri', 'Ahri', 'Mid'],
  ['Akali', 'Akali', 'Mid'],
  ['Akshan', 'Akshan', 'Top'],
  ['Alistar', 'Alistar', 'Support'],
  ['Ambessa', 'Ambessa', 'Top'],
  ['Amumu', 'Amumu', 'Jungle'],
  ['Anivia', 'Anivia', 'Mid'],
  ['Annie', 'Annie', 'Mid'],
  ['Aphelios', 'Aphelios', 'ADC'],
  ['Ashe', 'Ashe', 'ADC'],
  ['AurelionSol', 'Aurelion Sol', 'Mid'],
  ['Aurora', 'Aurora', 'Mid'],
  ['Azir', 'Azir', 'Mid'],
  ['Bard', 'Bard', 'Support'],
  ['Belveth', 'Belveth', 'Jungle'],
  ['Blitzcrank', 'Blitzcrank', 'Support'],
  ['Brand', 'Brand', 'Mid'],
  ['Braum', 'Braum', 'Support'],
  ['Briar', 'Briar', 'Jungle'],
  ['Caitlyn', 'Caitlyn', 'ADC'],
  ['Camille', 'Camille', 'Top'],
  ['Cassiopeia', 'Cassiopeia', 'Mid'],
  ['Chogath', 'Cho\'Gath', 'Top'],
  ['Corki', 'Corki', 'Mid'],
  ['Darius', 'Darius', 'Top'],
  ['Diana', 'Diana', 'Jungle'],
  ['DrMundo', 'Dr. Mundo', 'Top'],
  ['Draven', 'Draven', 'ADC'],
  ['Ekko', 'Ekko', 'Mid'],
  ['Elise', 'Elise', 'Jungle'],
  ['Evelynn', 'Evelynn', 'Jungle'],
  ['Ezreal', 'Ezreal', 'ADC'],
  ['Fiddlesticks', 'Fiddlesticks', 'Jungle'],
  ['Fiora', 'Fiora', 'Top'],
  ['Fizz', 'Fizz', 'Mid'],
  ['Galio', 'Galio', 'Mid'],
  ['Gangplank', 'Gangplank', 'Top'],
  ['Garen', 'Garen', 'Top'],
  ['Gnar', 'Gnar', 'Top'],
  ['Gragas', 'Gragas', 'Jungle'],
  ['Graves', 'Graves', 'Jungle'],
  ['Gwen', 'Gwen', 'Top'],
  ['Hecarim', 'Hecarim', 'Jungle'],
  ['Heimerdinger', 'Heimerdinger', 'Mid'],
  ['Hwei', 'Hwei', 'Mid'],
  ['Illaoi', 'Illaoi', 'Top'],
  ['Irelia', 'Irelia', 'Top'],
  ['Ivern', 'Ivern', 'Jungle'],
  ['Janna', 'Janna', 'Support'],
  ['JarvanIV', 'Jarvan IV', 'Jungle'],
  ['Jax', 'Jax', 'Top'],
  ['Jayce', 'Jayce', 'Top'],
  ['Jhin', 'Jhin', 'ADC'],
  ['Jinx', 'Jinx', 'ADC'],
  ['KSante', 'K\'Sante', 'Top'],
  ['Kaisa', 'Kai\'Sa', 'ADC'],
  ['Kalista', 'Kalista', 'ADC'],
  ['Karma', 'Karma', 'Support'],
  ['Karthus', 'Karthus', 'Jungle'],
  ['Kassadin', 'Kassadin', 'Mid'],
  ['Katarina', 'Katarina', 'Mid'],
  ['Kayle', 'Kayle', 'Top'],
  ['Kayn', 'Kayn', 'Jungle'],
  ['Kennen', 'Kennen', 'Top'],
  ['Khazix', 'Kha\'Zix', 'Jungle'],
  ['Kindred', 'Kindred', 'Jungle'],
  ['Kled', 'Kled', 'Top'],
  ['KogMaw', 'Kog\'Maw', 'ADC'],
  ['Leblanc', 'LeBlanc', 'Mid'],
  ['LeeSin', 'Lee Sin', 'Jungle'],
  ['Leona', 'Leona', 'Support'],
  ['Lillia', 'Lillia', 'Jungle'],
  ['Lissandra', 'Lissandra', 'Mid'],
  ['Lucian', 'Lucian', 'ADC'],
  ['Lulu', 'Lulu', 'Support'],
  ['Lux', 'Lux', 'Support'],
  ['Malphite', 'Malphite', 'Top'],
  ['Malzahar', 'Malzahar', 'Mid'],
  ['Maokai', 'Maokai', 'Support'],
  ['MasterYi', 'Master Yi', 'Jungle'],
  ['Milio', 'Milio', 'Support'],
  ['MissFortune', 'Miss Fortune', 'ADC'],
  ['MonkeyKing', 'Wukong', 'Jungle'],
  ['Mordekaiser', 'Mordekaiser', 'Top'],
  ['Morgana', 'Morgana', 'Support'],
  ['Nami', 'Nami', 'Support'],
  ['Nasus', 'Nasus', 'Top'],
  ['Nautilus', 'Nautilus', 'Support'],
  ['Neeko', 'Neeko', 'Mid'],
  ['Nidalee', 'Nidalee', 'Jungle'],
  ['Nilah', 'Nilah', 'ADC'],
  ['Nocturne', 'Nocturne', 'Jungle'],
  ['Nunu', 'Nunu & Willump', 'Jungle'],
  ['Olaf', 'Olaf', 'Jungle'],
  ['Orianna', 'Orianna', 'Mid'],
  ['Ornn', 'Ornn', 'Top'],
  ['Pantheon', 'Pantheon', 'Support'],
  ['Poppy', 'Poppy', 'Top'],
  ['Pyke', 'Pyke', 'Support'],
  ['Qiyana', 'Qiyana', 'Mid'],
  ['Quinn', 'Quinn', 'Top'],
  ['Rakan', 'Rakan', 'Support'],
  ['Rammus', 'Rammus', 'Jungle'],
  ['RekSai', 'Rek\'Sai', 'Jungle'],
  ['Rell', 'Rell', 'Support'],
  ['Renata', 'Renata Glasc', 'Support'],
  ['Renekton', 'Renekton', 'Top'],
  ['Rengar', 'Rengar', 'Jungle'],
  ['Riven', 'Riven', 'Top'],
  ['Rumble', 'Rumble', 'Top'],
  ['Ryze', 'Ryze', 'Mid'],
  ['Samira', 'Samira', 'ADC'],
  ['Sejuani', 'Sejuani', 'Jungle'],
  ['Senna', 'Senna', 'Support'],
  ['Seraphine', 'Seraphine', 'Support'],
  ['Sett', 'Sett', 'Top'],
  ['Shaco', 'Shaco', 'Jungle'],
  ['Shen', 'Shen', 'Top'],
  ['Shyvana', 'Shyvana', 'Jungle'],
  ['Singed', 'Singed', 'Top'],
  ['Sion', 'Sion', 'Top'],
  ['Sivir', 'Sivir', 'ADC'],
  ['Skarner', 'Skarner', 'Jungle'],
  ['Smolder', 'Smolder', 'ADC'],
  ['Sona', 'Sona', 'Support'],
  ['Soraka', 'Soraka', 'Support'],
  ['Swain', 'Swain', 'Mid'],
  ['Sylas', 'Sylas', 'Mid'],
  ['Syndra', 'Syndra', 'Mid'],
  ['TahmKench', 'Tahm Kench', 'Support'],
  ['Taliyah', 'Taliyah', 'Jungle'],
  ['Talon', 'Talon', 'Mid'],
  ['Taric', 'Taric', 'Support'],
  ['Teemo', 'Teemo', 'Top'],
  ['Thresh', 'Thresh', 'Support'],
  ['Tristana', 'Tristana', 'ADC'],
  ['Trundle', 'Trundle', 'Jungle'],
  ['Tryndamere', 'Tryndamere', 'Top'],
  ['TwistedFate', 'Twisted Fate', 'Mid'],
  ['Twitch', 'Twitch', 'ADC'],
  ['Udyr', 'Udyr', 'Jungle'],
  ['Urgot', 'Urgot', 'Top'],
  ['Varus', 'Varus', 'ADC'],
  ['Vayne', 'Vayne', 'ADC'],
  ['Veigar', 'Veigar', 'Mid'],
  ['Velkoz', 'Vel\'Koz', 'Mid'],
  ['Vex', 'Vex', 'Mid'],
  ['Vi', 'Vi', 'Jungle'],
  ['Viego', 'Viego', 'Jungle'],
  ['Viktor', 'Viktor', 'Mid'],
  ['Vladimir', 'Vladimir', 'Mid'],
  ['Volibear', 'Volibear', 'Top'],
  ['Warwick', 'Warwick', 'Jungle'],
  ['Xayah', 'Xayah', 'ADC'],
  ['Xerath', 'Xerath', 'Support'],
  ['XinZhao', 'Xin Zhao', 'Jungle'],
  ['Yasuo', 'Yasuo', 'Mid'],
  ['Yone', 'Yone', 'Mid'],
  ['Yorick', 'Yorick', 'Top'],
  ['Yuumi', 'Yuumi', 'Support'],
  ['Zac', 'Zac', 'Jungle'],
  ['Zed', 'Zed', 'Mid'],
  ['Zeri', 'Zeri', 'ADC'],
  ['Ziggs', 'Ziggs', 'Mid'],
  ['Zilean', 'Zilean', 'Support'],
  ['Zoe', 'Zoe', 'Mid'],
  ['Zyra', 'Zyra', 'Support'],
]

const champions: ChampionInput[] = RAW_CHAMPIONS.map(([ddId, displayName, role]) => ({
  name: displayName,
  lane: laneFromRole(role),
  imageUrl: `${DD_BASE}/${ddId}.png`,
}))

async function main() {
  console.log('🌱  Seeding database...')

  // Clear existing data (GTRVote before GTRRound due to FK)
  await prisma.gTRVote.deleteMany()
  await prisma.gTRRound.deleteMany()
  await prisma.question.deleteMany()
  await prisma.champion.deleteMany()

  // Seed questions
  for (const q of questions) {
    await prisma.question.create({
      data: {
        type: q.type,
        lane: q.lane,
        text: q.text,
        hint: q.hint ?? null,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      },
    })
  }
  console.log(`✅  ${questions.length} questions seeded`)

  // Seed champions
  for (const c of champions) {
    await prisma.champion.upsert({
      where: { name: c.name },
      update: { lane: c.lane, imageUrl: c.imageUrl },
      create: c,
    })
  }
  console.log(`✅  ${champions.length} champions seeded`)

  // Seed GTR rounds — first 3 use real YouTube LoL gameplay videos
  const gtrRounds = [
    // Gold: "Actions in gold rank game League of Legends" (youtube.com/watch?v=kad6Sj6Bnew)
    { imageUrl: 'https://www.youtube.com/embed/kad6Sj6Bnew', correctRank: 'gold' },
    // Platinum: "League of legends intense ranked match gameplay" (youtube.com/watch?v=ErLO-Y_4BWY)
    { imageUrl: 'https://www.youtube.com/embed/ErLO-Y_4BWY', correctRank: 'platinum' },
    // Diamond: "RANKING UP TO DIAMOND WITH GNAR IN SEASON 14" (youtube.com/watch?v=p9unqZmDVxw)
    { imageUrl: 'https://www.youtube.com/embed/p9unqZmDVxw', correctRank: 'diamond' },
    { imageUrl: 'https://placehold.co/800x450?text=GTR+Round+4', correctRank: 'iron' },
    { imageUrl: 'https://placehold.co/800x450?text=GTR+Round+5', correctRank: 'bronze' },
    { imageUrl: 'https://placehold.co/800x450?text=GTR+Round+6', correctRank: 'silver' },
    { imageUrl: 'https://placehold.co/800x450?text=GTR+Round+7', correctRank: 'emerald' },
    { imageUrl: 'https://placehold.co/800x450?text=GTR+Round+8', correctRank: 'master' },
    { imageUrl: 'https://placehold.co/800x450?text=GTR+Round+9', correctRank: 'grandmaster' },
    { imageUrl: 'https://placehold.co/800x450?text=GTR+Round+10', correctRank: 'challenger' },
  ]
  await prisma.gTRRound.createMany({ data: gtrRounds })
  console.log(`✅  ${gtrRounds.length} GTR rounds seeded`)

  // Upsert admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@gamersense.com' },
    update: { role: 'admin', passwordHash: adminHash },
    create: {
      username: 'admin',
      email: 'admin@gamersense.com',
      passwordHash: adminHash,
      role: 'admin',
    },
  })
  console.log('✅  Admin user seeded')

  console.log('🎉  Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
