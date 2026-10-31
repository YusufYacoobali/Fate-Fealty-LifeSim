import { ChainSpec } from './types';

export const CAREER_CHAINS: ChainSpec[] = [
  {
    id: 'masterpiece',
    domain: 'career',
    minAge: 16,
    beats: [
      {
        title: 'THE COPE-CHEST COMMISSION',
        text: '{{other.name}} brings the guild wardens’ commission: a carved cope-chest in seasoned oak, delivered by Michaelmas. No honest craftsman in the shire could promise that date, and the alderman’s own son wants the work.',
        choices: [
          { id: 'promise', label: 'Promise Michaelmas and worry later', text: 'You give them the date they wanted. The alderman’s son is furious, the wardens are delighted, and you have nine months to become somebody who can do this.', effects: { charm: 5, reputation: 4, faction: { factionId: 'guilds', playerStanding: 3 }, memory: { tag: 'promised_michaelmas', weight: 4, note: 'You promised a masterpiece by a date no honest craftsman could meet.' } }, tone: 'plain' },
          { id: 'honest_date', label: 'Give them the honest date', text: 'You say Candlemas and explain about seasoning oak. They take it to the alderman’s son, who promises Michaelmas within the hour.', effects: { wits: 5, faith: 3, reputation: 2, faction: { factionId: 'guilds', playerStanding: -2 }, memory: { tag: 'gave_the_honest_date', weight: 4 } }, tone: 'plain' },
          { id: 'partner', label: 'Ask to share it with another shop', text: 'Two shops, one mark, half the fee. The wardens dislike the arrangement and cannot fault the reasoning.', effects: { charm: 4, wits: 3, gold: -2, faction: { factionId: 'guilds', playerStanding: 2 }, memory: { tag: 'shared_the_commission', weight: 4 } }, tone: 'good' },
        ],
      },
      {
        title: 'THE OAK ARRIVES SPLIT',
        text: 'The timber comes in with three boards split along the grain. The supplier stands in your yard and explains at length that your shop dried it wrong, which is not possible, because it has been in your yard for six hours.',
        choices: [
          { id: 'fight_it', label: 'Take him before the guild court', text: 'You bring the carter, the tally and the six hours. He replaces the boards and adds your shop to a list he keeps of difficult customers.', effects: { wits: 6, gold: 4, faction: { factionId: 'guilds', playerStanding: 2 }, memory: { tag: 'won_against_the_timber_man', weight: 4 } }, tone: 'good' },
          { id: 'buy_again', label: 'Swallow it and buy more oak (12g)', costGold: 12, text: 'Twelve shillings out of your own purse and no argument in front of the apprentices. The work stays on time and the supplier does it again in spring.', effects: { gold: -12, householdState: { wealth: -2 }, faction: { factionId: 'guilds', playerStanding: 1 }, memory: { tag: 'ate_the_timber_loss', weight: 4 } }, tone: 'plain' },
          { id: 'use_split', label: 'Work round the splits and say nothing', text: 'You hide two splits inside the carcase where nobody will look for thirty years. Somebody will look in thirty years.', effects: { wits: 4, gold: 6, createSecret: { type: 'stolen_property', severity: 30, knownByIds: [] }, memory: { tag: 'hid_the_split_boards', weight: 5, note: 'There are split boards concealed inside your masterpiece.' } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE APPRENTICE HAS A BETTER JOINT',
        text: 'Your apprentice proposes a housed dovetail nobody in the shire cuts. It would save five weeks and put his hand permanently beside yours in the finished work.',
        choices: [
          { id: 'take_it', label: 'Cut it his way and say whose it is', text: 'You use the joint and tell the wardens whose idea it was. Your standing with the guild improves, and {{other.name}} trusts you with the next suggestion.', effects: { charm: 5, wits: 5, faction: { factionId: 'guilds', playerStanding: 4 }, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'credited_the_apprentice', weight: 5 } }, tone: 'good' },
          { id: 'take_credit', label: 'Cut it his way and say nothing', text: 'You take the payment and the credit. {{other.name}} knows where the joint came from and loses trust in you; no journey is needed to carry that grievance.', effects: { reputation: 6, gold: 8, faith: -4, boundKinRel: { role: 'other', delta: -18 }, memory: { tag: 'took_the_apprentices_joint', weight: 5, note: 'The joint your masterpiece is famous for was your apprentice’s idea.' } }, tone: 'plain' },
          { id: 'refuse_it', label: 'Cut it the way it has always been cut', text: 'Five weeks longer, the old joint, no argument with the wardens. It is the safe decision and the apprentice stops offering things.', effects: { health: -4, wits: 2, faction: { factionId: 'guilds', playerStanding: 2 }, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'refused_the_new_joint', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE PATRON WANTS IT CHEAPER',
        text: 'With six weeks left the patron asks for elm instead of oak and paint instead of carving, while still describing the piece to everyone in the county as a masterpiece.',
        choices: [
          { id: 'refuse_cheap', label: 'Refuse and finish it properly', text: 'You finish it in oak at your own cost. The patron pays the reduced fee, tells everyone he commissioned it, and you are thirteen shillings poorer and correct.', effects: { gold: -11, reputation: 6, faith: 4, faction: { factionId: 'guilds', playerStanding: 4 }, memory: { tag: 'finished_it_properly_at_a_loss', weight: 5 } }, tone: 'good' },
          { id: 'do_it_cheap', label: 'Give him exactly what he is paying for', text: 'Elm, paint, and a bill that matches. It looks well from six feet and you make certain the wardens know which decisions were his.', effects: { gold: 10, wits: 4, reputation: -3, memory: { tag: 'built_the_cheap_version', weight: 4 } }, tone: 'plain' },
          { id: 'go_to_wardens', label: 'Take it to the wardens', text: 'The guild rules a master may not be made to put his mark on elm. The patron pays in full, loudly, and never commissions anything in this town again.', effects: { charm: 3, wits: 5, gold: 6, faction: { factionId: 'guilds', playerStanding: 5 }, memory: { tag: 'wardens_forced_the_patron', weight: 5 } }, tone: 'good' },
        ],
      },
      {
        title: 'THE UNVEILING AT THE GUILD HALL',
        text: 'The cope-chest stands in the hall with the wardens, the parish and the alderman’s son around it. Somebody is about to say aloud whose work it actually is.',
        choices: [
          { id: 'tell_it', label: 'Tell the whole history of it', text: 'The oak, the splits, the joint, the elm, the apprentice. It is a very strange speech for an unveiling. They are still repeating it in that hall forty years later, and getting the ending wrong.', effects: { reputation: 8, faith: 4, charm: 4, faction: { factionId: 'guilds', playerStanding: 4 }, familyReputation: { delta: 4 }, memory: { tag: 'told_the_whole_history', weight: 5, note: 'You gave a full public account of how your masterpiece was really made.' } }, tone: 'good' },
          { id: 'accept_praise', label: 'Accept the praise and go home', text: 'You bow, you are admired, and you leave early. The chest is beautiful and everything anybody says about it is slightly wrong.', effects: { reputation: 6, gold: 12, householdState: { status: 3 }, memory: { tag: 'accepted_the_praise', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'caravan_partnership',
    domain: 'career',
    minAge: 18,
    beats: [
      {
        title: 'FOUR CARTS TO STOURBRIDGE',
        text: '{{other.name}} proposes a shared venture to Stourbridge fair: four carts, four partners, one purse. The profit is real and so are the roads between here and Cambridge.',
        choices: [
          { id: 'join_full', label: 'Put in a full share (20g)', costGold: 20, text: 'Twenty shillings into a common purse held by a man you have known nine years. The others put in the same and everyone shakes on it in the alehouse.', effects: { gold: -20, boundKinRel: { role: 'other', delta: 8 }, faction: { factionId: 'guilds', playerStanding: 3 }, memory: { tag: 'joined_the_caravan', weight: 4 } }, tone: 'plain' },
          { id: 'join_small', label: 'Put in a quarter share and keep the rest', text: 'You take a small stake and a small risk, and {{other.name}} notes exactly how small before agreeing very pleasantly.', effects: { gold: -6, wits: 4, boundKinRel: { role: 'other', delta: -3 }, memory: { tag: 'took_a_small_stake', weight: 3 } }, tone: 'plain' },
          { id: 'lend_instead', label: 'Lend them the money at interest instead', text: 'You are not a partner, you are a creditor, and the difference will matter enormously in about nine months.', effects: { gold: -12, wits: 5, faith: -3, boundKinRel: { role: 'other', delta: -5 }, memory: { tag: 'lent_rather_than_joined', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'ONE CART GONE IN THE NIGHT',
        text: 'A cart vanishes overnight outside Huntingdon with goods belonging to every partner except {{other.name}}, whose bales were moved onto another cart the previous evening for reasons that were entirely sensible at the time.',
        choices: [
          { id: 'accuse', label: 'Say the obvious thing aloud', text: 'You put it to them in front of the other partners. They have an answer for the bales and no answer at all for the timing.', effects: { wits: 5, boundKinRel: { role: 'other', delta: -14 }, faction: { factionId: 'guilds', playerStanding: 1 }, memory: { tag: 'accused_the_partner', weight: 5 } }, tone: 'plain' },
          { id: 'share_loss', label: 'Insist the loss is shared four ways', text: 'You argue it through half a night and win. Everyone loses the same amount and the partnership survives, slightly bent.', effects: { charm: 6, gold: -5, boundKinRel: { role: 'other', delta: 10 }, worldConditions: { prosperity: 1 }, memory: { tag: 'shared_the_caravan_loss', weight: 4 } }, tone: 'good' },
          { id: 'watch', label: 'Say nothing and start keeping notes', text: 'You write down dates, bales and names in a little book. By Candlemas you have a very complete picture and nobody knows you have it.', effects: { wits: 6, createSecret: { type: 'hidden_debt', severity: 35, knownByIds: [] }, memory: { tag: 'kept_notes_on_the_partners', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE DRIVER COMES BACK',
        text: 'The missing driver walks into Swineford three weeks later with a story about soldiers, mud, and a bargain struck at knifepoint. Roughly half of it can be checked and roughly half of it checks out.',
        choices: [
          { id: 'believe', label: 'Believe him and pay his wages', text: 'You pay him for the weeks he was gone. He works for you for eighteen years and never once mentions it, which is either gratitude or discipline.', effects: { gold: -4, charm: 4, faith: 3, memory: { tag: 'believed_the_driver', weight: 4 } }, tone: 'good' },
          { id: 'test_story', label: 'Ride to Huntingdon and check it', text: 'Four days and a lame horse. Half the story is true. That is the worst answer he could have brought back, and you have to act on it anyway.', effects: { wits: 6, gold: -5, health: -2, memory: { tag: 'checked_the_drivers_story', weight: 4 } }, tone: 'plain' },
          { id: 'turn_him_over', label: 'Hand him to the constable', text: 'He is held six weeks and released without charge. He does not come back to Swineford and his family stops speaking to yours entirely.', effects: { reputation: 2, faction: { factionId: 'crown', playerStanding: 2 }, faith: -4, worldConditions: { publicOrder: 1 }, memory: { tag: 'handed_over_the_driver', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'SAFE PASSAGE, MINUS ONE',
        text: 'A rival merchant offers the partnership armed escort on the Cambridge road for the rest of the season. His condition is that the poorest partner is dropped from the venture first.',
        choices: [
          { id: 'refuse_terms', label: 'Refuse and travel unescorted', text: 'You go without the escort and nobody is dropped. It costs you two more losses that season and the partnership never once discusses breaking up.', effects: { gold: -8, charm: 5, boundKinRel: { role: 'other', delta: 12 }, faction: { factionId: 'guilds', playerStanding: 3 }, memory: { tag: 'refused_to_drop_a_partner', weight: 5 } }, tone: 'good' },
          { id: 'accept_terms', label: 'Take the escort', text: 'The poorest partner is out by Lady Day. The roads are safe, the season is excellent, and there is now an empty chair at every meeting.', effects: { gold: 18, boundKinRel: { role: 'other', delta: -12 }, faction: { factionId: 'guilds', playerStanding: 2 }, faith: -4, memory: { tag: 'dropped_the_poorest_partner', weight: 5, note: 'You traded a partner for safe passage on the Cambridge road.' } }, tone: 'plain' },
          { id: 'buy_his_share', label: 'Buy the poor partner’s share yourself (14g)', costGold: 14, text: 'You buy him out at a fair price, take the escort, and hold his stake in your own name. It is generous, it is profitable, and it is not the same as loyalty.', effects: { gold: -14, wits: 5, householdState: { wealth: 4 }, boundKinRel: { role: 'other', delta: 4 }, memory: { tag: 'bought_out_the_poor_partner', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'WHAT COMES BACK DOWN THE ROAD',
        text: 'The carts come home with less silver than anyone hoped and a reputation that may prove worth more. Every merchant between here and Cambridge now knows how this partnership behaved when it went wrong.',
        choices: [
          { id: 'renew', label: 'Renew the partnership for another season', text: 'The same four names, or the three that are left. They sign again, which after this year is a considerably more serious thing than it was.', effects: { charm: 4, gold: 8, worldConditions: { prosperity: 2 }, faction: { factionId: 'guilds', playerStanding: 4 }, memory: { tag: 'renewed_the_partnership', weight: 5 } }, tone: 'good' },
          { id: 'dissolve', label: 'Dissolve it and trade alone', text: 'You divide the purse on the table and shake hands. It is amicable, it is final, and you are considerably richer and slower for the next ten years.', effects: { gold: 14, wits: 4, householdState: { wealth: 3 }, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'dissolved_the_partnership', weight: 5 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'apprentice_revolt',
    domain: 'career',
    minAge: 16,
    beats: [
      {
        title: 'HOURS BEYOND THE ORDINANCE',
        text: '{{other.name}} speaks for the apprentices of three shops. The guild ordinance sets the working day from dawn bell to curfew; the masters have been quietly adding two hours at each end since Lady Day.',
        choices: [
          { id: 'back_them', label: 'Back the apprentices openly', text: 'You put your name to their complaint. Two masters stop sending you work the same week and the apprentices remember it for thirty years.', effects: { charm: 5, gold: -6, faction: { factionId: 'guilds', playerStanding: -3 }, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'backed_the_apprentices', weight: 5 } }, tone: 'plain' },
          { id: 'read_ordinance', label: 'Read the ordinance to both sides', text: 'You find the clause, copy it, and nail it to three shop doors. Nobody can claim not to know now. That was the point, and it costs you three friendly shops by Whitsun.', effects: { wits: 6, reputation: 3, faction: { factionId: 'guilds', playerStanding: 1 }, memory: { tag: 'nailed_up_the_ordinance', weight: 4 } }, tone: 'good' },
          { id: 'stay_out', label: 'Keep out of it', text: 'It is not your shop and not your quarrel. It becomes your quarrel by Candlemas, on worse terms.', effects: { wits: 2, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'stayed_out_of_the_shop_quarrel', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A CONTRACT OFFERED QUIETLY',
        text: 'A master dismisses the complaint in public. In private he offers you the good commissions, first refusal, for a year, on the understanding that you have no further opinions.',
        choices: [
          { id: 'take_it', label: 'Take the contracts', text: 'The work is genuinely good and the silence is genuinely purchased. Both facts are true at once and only one of them is discussed.', effects: { gold: 16, faction: { factionId: 'guilds', playerStanding: 3 }, boundKinRel: { role: 'other', delta: -14 }, faith: -3, memory: { tag: 'took_the_silence_contracts', weight: 5, note: 'You were paid in commissions to stop speaking for the apprentices.' } }, tone: 'plain' },
          { id: 'refuse_loudly', label: 'Refuse, and say what was offered', text: 'You describe the offer word for word at the next guild meeting. The master denies it, everyone believes you, and nothing whatsoever is done about it.', effects: { reputation: 6, gold: -8, faction: { factionId: 'guilds', playerStanding: -4 }, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'named_the_bribe_at_the_guild', weight: 5 } }, tone: 'plain' },
          { id: 'take_and_keep', label: 'Take the contracts and speak anyway', text: 'You take the work and go on saying exactly what you said before. He cannot withdraw it without admitting what it was for, and you both know it.', effects: { gold: 12, wits: 6, charm: 4, faction: { factionId: 'guilds', playerStanding: -2 }, memory: { tag: 'took_the_work_and_spoke_anyway', weight: 5 } }, tone: 'good' },
        ],
      },
      {
        title: 'TOOLS DOWN IN THREE SHOPS',
        text: 'The apprentices lay down their tools. Three shops are silent, the unfinished orders are somebody’s wedding chest and somebody’s coffin, and the town starts losing money on the second day.',
        choices: [
          { id: 'mediate', label: 'Get both sides in one room', text: 'Four hours, one barrel, and a written agreement about bells. It holds because everybody had to say their terms out loud in front of the other side.', effects: { charm: 7, wits: 4, worldConditions: { prosperity: 2, publicOrder: 2 }, faction: { factionId: 'guilds', playerStanding: 3 }, memory: { tag: 'mediated_the_tools_down', weight: 5 } }, tone: 'good' },
          { id: 'finish_orders', label: 'Finish the urgent orders yourself', text: 'You work nine days straight and deliver the coffin on time. The masters are grateful and the apprentices watch you undercut the only pressure they had.', effects: { gold: 14, health: -8, boundKinRel: { role: 'other', delta: -16 }, faction: { factionId: 'guilds', playerStanding: 4 }, memory: { tag: 'broke_the_tools_down', weight: 5 } }, tone: 'plain' },
          { id: 'feed_them', label: 'Feed the apprentices out of your own stores', text: 'Bread and pottage for nine young men for three weeks. It empties your lardarium and it is the reason the strike lasts long enough to win anything.', effects: { householdState: { food: -6 }, faction: { factionId: 'commons', playerStanding: 5 }, boundKinRel: { role: 'other', delta: 16 }, memory: { tag: 'fed_the_striking_apprentices', weight: 5 } }, tone: 'good' },
        ],
      },
      {
        title: 'ONE NAME OR ALL OF THEM',
        text: 'The guild threatens to strike every apprentice from the register unless one of them accepts the blame in writing and is expelled for it. {{other.name}} is the obvious name and knows it.',
        choices: [
          { id: 'take_blame', label: 'Put your own name on it instead', text: 'You sign as the instigator. You are barred from guild work for two years and nine apprentices keep their indentures, and everybody in the trade knows why.', effects: { gold: -20, reputation: 8, faith: 6, faction: { factionId: 'guilds', playerStanding: -6 }, boundKinRel: { role: 'other', delta: 20 }, memory: { tag: 'took_the_blame_for_the_revolt', weight: 5, note: 'You were struck off the guild register to save nine apprentices.' } }, tone: 'plain' },
          { id: 'let_them', label: 'Let {{other.name}} take it', text: 'They sign, they are expelled, and they leave for Bristol in April. The eight who stayed are careful never to say the name out loud again.', effects: { boundKinRel: { role: 'other', delta: -20 }, faction: { factionId: 'guilds', playerStanding: 2 }, faith: -5, memory: { tag: 'let_them_take_the_blame', weight: 5 } }, tone: 'bad' },
          { id: 'call_bluff', label: 'Tell the guild to strike off all fifteen', text: 'You point out that nine expelled apprentices is nine shops without hands in July. The threat is quietly withdrawn and never referred to again.', effects: { wits: 7, charm: 5, faction: { factionId: 'guilds', playerStanding: -2 }, boundKinRel: { role: 'other', delta: 14 }, worldConditions: { prosperity: 1 }, memory: { tag: 'called_the_guilds_bluff', weight: 5 } }, tone: 'good' },
        ],
      },
      {
        title: 'THE NEW CHARTER READ ALOUD',
        text: 'A revised shop charter is read out in the guild hall: hours, bells, holidays, and the price of a broken indenture. Everybody present can hear exactly whose bad year became a permanent rule.',
        choices: [
          { id: 'sign_it', label: 'Put your seal to it', text: 'You seal it with the rest. It is worse than what was asked for and enormously better than what there was, and it outlives everyone in the room.', effects: { reputation: 5, faction: { factionId: 'guilds', playerStanding: 3 }, worldConditions: { prosperity: 2, publicOrder: 2 }, memory: { tag: 'sealed_the_new_charter', weight: 5 } }, tone: 'good' },
          { id: 'refuse_sign', label: 'Refuse to seal it', text: 'You say it gives back less than it took and decline. The charter passes without you, and in eight years somebody quotes your refusal in a very different argument.', effects: { wits: 4, reputation: 3, faction: { factionId: 'guilds', playerStanding: -3 }, boundKinRel: { role: 'other', delta: 8 }, memory: { tag: 'refused_the_new_charter', weight: 5 } }, tone: 'plain' },
        ],
      },
    ],
  },
];
