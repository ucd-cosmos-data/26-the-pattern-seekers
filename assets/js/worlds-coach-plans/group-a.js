(function (root, factory) {
  "use strict";

  var plans = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = plans;
  } else {
    root.WorldsCoachPlanGroups = root.WorldsCoachPlanGroups || [];
    root.WorldsCoachPlanGroups.push(plans);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    "NED|USA": {
      recommendation: {
        player: "Denzel Dumfries",
        plan: "Invite the USA press toward Blind, then switch early for Dumfries to arrive beyond Robinson before Ream can cover.",
        why: "The American midfield jumps aggressively toward the ball, leaving its far fullback exposed to a wingback arriving from depth."
      },
      attack: {
        style: "wingback",
        flank: "right",
        tempo: 1.04,
        widthScale: 1.08,
        depthShift: 1,
        laneShift: 3,
        stagger: 0.8,
        intent: "Stretch the USA's narrow midfield with Blind, then send Dumfries through the weak-side channel behind Robinson.",
        stepTitles: [
          "Blind Draws the Press",
          "De Jong Breaks the Hinge",
          "Dumfries Hits the Blind Side",
          "Dumfries Serves Depay and Blind"
        ],
        stepCaptions: [
          "Blind holds the left touchline while Depay checks short, pulling Weah and McKennie toward the first pass.",
          "De Jong receives beneath the first jump and carries across Adams to open the diagonal switch.",
          "Dumfries accelerates outside Robinson as Gakpo pins Ream, creating a cutback lane instead of an early cross.",
          "Dumfries drives his final ball across Ream for Depay near goal while Blind arrives beyond Dest at the back post."
        ]
      },
      press: {
        style: "mid",
        flank: "left",
        tempo: 0.98,
        widthScale: 1.02,
        depthShift: 0,
        laneShift: -2,
        stagger: 0.4,
        intent: "Screen Adams, concede the pass to Ream, and trap the USA when Robinson receives with the touchline behind him.",
        stepTitles: [
          "Depay Shadows Adams",
          "Ream Gets the Invitation",
          "Robinson Meets the Clamp",
          "De Jong Sends Depay Through the Middle"
        ],
        stepCaptions: [
          "Depay protects the central lane into Adams while Gakpo waits between Zimmerman and Dest.",
          "The front line permits Ream's lateral reception so the Dutch block can slide without losing midfield compactness.",
          "Dumfries jumps Robinson, De Jong closes Musah, and Timber protects the Pulisic run inside the trap.",
          "De Jong collects Robinson's forced turnover and releases Depay through the center before Adams can restore the USA block."
        ]
      },
      transition: {
        style: "counter",
        flank: "right",
        tempo: 1.1,
        widthScale: 1.06,
        depthShift: 2,
        laneShift: 3,
        stagger: 1,
        intent: "Turn a regain near Pulisic into an immediate diagonal release for Dumfries before the USA can restore its fullback line.",
        stepTitles: [
          "Timber Wins the Inside Ball",
          "Gakpo Pins Ream",
          "Dumfries Races Robinson"
        ],
        stepCaptions: [
          "Timber steps through Pulisic's inside touch while De Jong positions for the first forward pass.",
          "Gakpo runs centrally across Ream, preventing the defender from helping Robinson on the outside.",
          "Dumfries takes the diagonal in stride and drives to the byline with Depay arriving behind the retreating midfield."
        ]
      }
    },

    "USA|NED": {
      recommendation: {
        player: "Christian Pulisic",
        plan: "Start Pulisic narrow beside De Jong, then burst behind Dumfries as Robinson's overlap drags Timber toward the touchline.",
        why: "The Dutch right wingback advances early, and the seam between Dumfries and Timber is vulnerable before the back five resets."
      },
      attack: {
        style: "wing",
        flank: "left",
        tempo: 1.06,
        widthScale: 1.05,
        depthShift: 1,
        laneShift: -3,
        stagger: 0.6,
        intent: "Use Robinson's overlap to displace Dumfries and free Pulisic for an inside run across Timber's outside shoulder.",
        stepTitles: [
          "Musah Tilts the Dutch Midfield",
          "Robinson Pulls Dumfries Wide",
          "Pulisic Splits the Right Pair",
          "Pulisic Cuts Back for McKennie"
        ],
        stepCaptions: [
          "Musah carries left of De Jong, forcing Koopmeiners to leave the central screen and support the Dutch right.",
          "Robinson overlaps at full speed so Dumfries must defend the touchline instead of tracking the half-space.",
          "Pulisic darts between Dumfries and Timber to receive Dest's disguised diagonal before Van Dijk can shift.",
          "Pulisic reaches the byline and pulls behind Van Dijk for McKennie's late run while Sargent occupies the near post."
        ]
      },
      press: {
        style: "high",
        flank: "left",
        tempo: 1.08,
        widthScale: 0.98,
        depthShift: 2,
        laneShift: -2,
        stagger: 1.1,
        intent: "Curve Weah's press through Van Dijk, lock Blind to the sideline, and keep Adams attached to De Jong's escape route.",
        stepTitles: [
          "Weah Bends the First Run",
          "Sargent Seals Van Dijk",
          "Adams Erases De Jong",
          "McKennie Turns Blind's Error Goalward"
        ],
        stepCaptions: [
          "Weah approaches Noppert from the right to make the goalkeeper's comfortable outlet point toward Blind.",
          "Sargent blocks the return through Van Dijk while McKennie advances onto Koopmeiners.",
          "Adams follows De Jong's movement beneath the ball as Dest jumps Blind and the left-side cage closes.",
          "McKennie gathers the ball stripped from Blind and feeds Pulisic immediately, attacking before Noppert can reset his goal."
        ]
      },
      transition: {
        style: "counter",
        flank: "left",
        tempo: 1.12,
        widthScale: 1.04,
        depthShift: 3,
        laneShift: -3,
        stagger: 1.2,
        intent: "Release Pulisic into the space Dumfries leaves, with Weah holding Aké away from the recovery lane.",
        stepTitles: [
          "Adams Springs the Regain",
          "Weah Occupies Aké",
          "Pulisic Attacks Timber's Turn"
        ],
        stepCaptions: [
          "Adams collects the second ball behind De Jong and plays forward before the Dutch midfield can counterpress.",
          "Weah sprints across Aké toward the far channel, delaying the center back's cover movement.",
          "Pulisic drives at Timber's back foot while Robinson overlaps late enough to preserve a two-versus-one."
        ]
      }
    },

    "ARG|AUS": {
      recommendation: {
        player: "Lionel Messi",
        plan: "Keep Messi outside Australia's midfield screen until Álvarez pins Souttar, then find him behind Mooy for the final pass.",
        why: "Mooy and Irvine protect the center in a flat line, but neither can turn quickly when a forward fixes the center backs and Messi arrives late."
      },
      attack: {
        style: "central",
        flank: "right",
        tempo: 0.96,
        widthScale: 0.96,
        depthShift: 1,
        laneShift: 2,
        stagger: -0.3,
        intent: "Circulate patiently around Australia's 4-4-2 before Messi enters the pocket behind Mooy and beside Rowles.",
        stepTitles: [
          "De Paul Pulls Goodwin In",
          "Álvarez Locks Souttar",
          "Messi Appears Behind Mooy",
          "Messi Releases Álvarez Between the Pair"
        ],
        stepCaptions: [
          "De Paul drops toward Molina, drawing Goodwin narrow and widening the passing lane from Romero.",
          "Álvarez occupies Souttar on the last line while Mac Allister runs beyond Irvine to prevent a midfield collapse.",
          "Messi checks into the uncovered right pocket and combines first time before Rowles can step across.",
          "Messi disguises the through-ball between Rowles and Souttar for Álvarez to finish before Ryan can narrow the angle."
        ]
      },
      press: {
        style: "high",
        flank: "left",
        tempo: 1.07,
        widthScale: 0.97,
        depthShift: 2,
        laneShift: -2,
        stagger: 0.9,
        intent: "Force Ryan toward Rowles, then close the left sideline while Fernández screens the direct outlet into Duke.",
        stepTitles: [
          "Álvarez Shows Ryan Left",
          "Di María Hunts Rowles",
          "Fernández Guards the Duke Ball",
          "De Paul Punishes Rowles' Turnover"
        ],
        stepCaptions: [
          "Álvarez arcs away from Souttar to remove Ryan's central pass and shape the buildup toward Rowles.",
          "Di María accelerates once the ball travels, with De Paul stepping onto Mooy behind the pressure.",
          "Fernández stays goal-side of Duke's dropping lane so Otamendi can attack any hopeful clearance.",
          "De Paul claims the rushed ball from Rowles and slips Álvarez toward goal while Australia's back line remains compressed."
        ]
      },
      transition: {
        style: "swarm",
        flank: "right",
        tempo: 1.09,
        widthScale: 0.95,
        depthShift: 1,
        laneShift: 2,
        stagger: 1.1,
        intent: "Smother Australia's first pass toward Leckie and use Messi as the immediate outlet once the ball is recovered.",
        stepTitles: [
          "Mac Allister Blocks Irvine",
          "Acuña Squeezes Leckie",
          "Messi Receives the Loose Ball"
        ],
        stepCaptions: [
          "Mac Allister closes Irvine from the blind side while Fernández prevents the reset through Mooy.",
          "Acuña steps tight to Leckie and Otamendi advances behind him, compressing the left-side duel.",
          "De Paul gathers the spill and finds Messi facing forward before Australia's two banks can reform."
        ]
      }
    },

    "AUS|ARG": {
      recommendation: {
        player: "Mathew Leckie",
        plan: "Hold Leckie inside until Souttar shapes to pass, then send him beyond Acuña onto the diagonal before Romero can cover.",
        why: "Acuña advances to support Argentina's possession, and Leckie's pace offers Australia's clearest route past the first counterpress."
      },
      attack: {
        style: "direct",
        flank: "right",
        tempo: 1.03,
        widthScale: 1.03,
        depthShift: 2,
        laneShift: 3,
        stagger: 0.8,
        intent: "Use Souttar's diagonal range to bypass Argentina's midfield and put Leckie into Acuña's vacated channel.",
        stepTitles: [
          "Mooy Draws De Paul Forward",
          "Souttar Opens the Diagonal",
          "Leckie Escapes Acuña",
          "Mooy Claims Duke's Knockdown"
        ],
        stepCaptions: [
          "Mooy drops beside Rowles and invites De Paul to leave the right side of Argentina's midfield line.",
          "Souttar carries past Álvarez's cover shadow and shapes for a fast diagonal over Mac Allister.",
          "Leckie starts inside Acuña, spins outside on release, and attacks the second ball with Duke occupying Otamendi.",
          "Duke contests Souttar's delivery against Otamendi and Mooy arrives ahead of Fernández to strike the falling second ball."
        ]
      },
      press: {
        style: "mid",
        flank: "left",
        tempo: 0.94,
        widthScale: 0.96,
        depthShift: -1,
        laneShift: -2,
        stagger: -0.4,
        intent: "Protect the Messi pocket with Irvine and Behich, allowing Argentina's center backs to pass without opening the middle.",
        stepTitles: [
          "Duke Screens Fernández",
          "Irvine Tracks Messi's Drift",
          "Behich Closes the Left Gate",
          "Irvine Releases Leckie on the Regain"
        ],
        stepCaptions: [
          "Duke holds between Romero and Fernández so Argentina must build around rather than through the pivot.",
          "Irvine stays on Messi's inside shoulder and passes Mac Allister's run to Mooy instead of chasing it.",
          "Behich narrows behind Goodwin when Messi moves right, preserving cover against Molina's overlap.",
          "Irvine wins the pass forced into Australia's block and sends Leckie centrally before Acuña and Romero can retreat."
        ]
      },
      transition: {
        style: "counter",
        flank: "right",
        tempo: 1.1,
        widthScale: 1.02,
        depthShift: 3,
        laneShift: 4,
        stagger: 1.3,
        intent: "Make the first regain pass away from Argentina's central swarm and chase Leckie into the open right corridor.",
        stepTitles: [
          "Irvine Escapes the Swarm",
          "Duke Pins Otamendi",
          "Leckie Chases the Channel"
        ],
        stepCaptions: [
          "Irvine turns his recovery touch toward the right touchline, avoiding Fernández and Mac Allister around the ball.",
          "Duke leans into Otamendi and keeps Romero from stepping freely toward the direct pass.",
          "Leckie accelerates beyond Acuña, with McGree following inside for the cutback or second ball."
        ]
      }
    },

    "FRA|POL": {
      recommendation: {
        player: "Kylian Mbappé",
        plan: "Pin Cash with Hernández, feed Mbappé inside Frankowski, and return the ball into his run before Glik can leave Giroud.",
        why: "Poland's right side must choose between following Hernández wide and protecting an aging center-back pairing from Mbappé's diagonal acceleration."
      },
      attack: {
        style: "wing",
        flank: "left",
        tempo: 1.08,
        widthScale: 1.06,
        depthShift: 2,
        laneShift: -3,
        stagger: 0.9,
        intent: "Overload Poland's right edge with Hernández and Mbappé while Giroud prevents Glik from covering the channel.",
        stepTitles: [
          "Hernández Fixes Cash Wide",
          "Griezmann Finds Mbappé Inside",
          "Giroud Removes Glik's Cover",
          "Mbappé Pulls Back for Giroud"
        ],
        stepCaptions: [
          "Hernández advances outside Mbappé, making Cash defend the touchline and pulling Frankowski toward the overlap.",
          "Griezmann drifts behind Krychowiak and slips Mbappé into the inside-left lane on the defender's blind side.",
          "Giroud pins Glik near the penalty spot as Mbappé attacks Kiwior and cuts the ball across Szczęsny.",
          "Mbappé reaches Cash's outside shoulder and cuts low behind Kiwior for Giroud, with Rabiot waiting for the loose clearance."
        ]
      },
      press: {
        style: "mid",
        flank: "right",
        tempo: 0.99,
        widthScale: 0.98,
        depthShift: 0,
        laneShift: 2,
        stagger: 0.3,
        intent: "Deny Zieliński between the lines and spring Dembélé onto Bereszyński when Poland builds down its left.",
        stepTitles: [
          "Griezmann Screens Zieliński",
          "Giroud Guides the Pass Left",
          "Dembélé Traps Bereszyński",
          "Griezmann Springs Mbappé from Midfield"
        ],
        stepCaptions: [
          "Griezmann stays between Krychowiak and Zieliński, removing Poland's route through its most creative midfielder.",
          "Giroud shades Glik and lets the ball travel toward Kiwior, where France's right side can advance together.",
          "Dembélé presses Bereszyński while Koundé closes Kamiński and Tchouaméni protects the pass into Lewandowski.",
          "Griezmann collects the trapped pass near halfway and releases Mbappé through Poland's stretched center before Cash can recover."
        ]
      },
      transition: {
        style: "counter",
        flank: "left",
        tempo: 1.12,
        widthScale: 1.05,
        depthShift: 3,
        laneShift: -4,
        stagger: 1.4,
        intent: "Find Mbappé beyond Cash immediately after a regain while Giroud and Griezmann occupy Poland's central recovery defenders.",
        stepTitles: [
          "Rabiot Wins the Zieliński Duel",
          "Griezmann Turns Krychowiak",
          "Mbappé Bursts Past Cash"
        ],
        stepCaptions: [
          "Rabiot recovers on Zieliński's first touch and plays forward rather than recycling into Poland's retreat.",
          "Griezmann receives between Krychowiak and Glik, turning with Giroud holding Kiwior centrally.",
          "Mbappé takes the release outside Cash and carries into the box before Frankowski can recover from attack."
        ]
      }
    },

    "POL|FRA": {
      recommendation: {
        player: "Robert Lewandowski",
        plan: "Let Lewandowski pin Varane, then attack the far side of Upamecano when Cash delivers before France's midfield pressure arrives.",
        why: "Poland cannot out-circulate France for long, but an early cross can isolate its elite finisher against a back line still retreating."
      },
      attack: {
        style: "direct",
        flank: "right",
        tempo: 1.01,
        widthScale: 1.04,
        depthShift: 1,
        laneShift: 3,
        stagger: 0.5,
        intent: "Advance through Cash before Mbappé recovers and target Lewandowski between Varane and Upamecano with an early delivery.",
        stepTitles: [
          "Zieliński Releases Cash Early",
          "Świderski Pulls Upamecano Near",
          "Lewandowski Attacks Varane's Far Side",
          "Zieliński Sweeps Up Lewandowski's Knockdown"
        ],
        stepCaptions: [
          "Zieliński turns away from Rabiot and sends Cash forward before Hernández can close the wide lane.",
          "Świderski runs into the near channel, forcing Upamecano to defend the first-post route.",
          "Lewandowski starts on Varane, then curves behind him to meet Cash's cross away from Tchouaméni.",
          "Lewandowski redirects Cash's delivery toward the edge, where Zieliński arrives before Rabiot to control the second ball."
        ]
      },
      press: {
        style: "low",
        flank: "right",
        tempo: 0.92,
        widthScale: 0.94,
        depthShift: -3,
        laneShift: 2,
        stagger: -1,
        intent: "Build a compact right-side cage around Mbappé without pulling Krychowiak away from Griezmann's central pocket.",
        stepTitles: [
          "Frankowski Delays Hernández",
          "Cash Protects Mbappé's Inside Cut",
          "Krychowiak Holds Griezmann",
          "Glik Clears Hernández's Delivery"
        ],
        stepCaptions: [
          "Frankowski recovers outside Cash and meets Hernández early enough to stop a free overlap.",
          "Cash defends slightly inside Mbappé, conceding the backward pass rather than the diagonal run toward goal.",
          "Krychowiak stays central on Griezmann as Glik covers Giroud's run through the heart of the box.",
          "Glik attacks Hernández's forced cross ahead of Giroud, then Cash and Kiwior step out together behind his clearance."
        ]
      },
      transition: {
        style: "secure",
        flank: "right",
        tempo: 0.95,
        widthScale: 0.97,
        depthShift: -1,
        laneShift: 2,
        stagger: -0.6,
        intent: "Escape France's counterpress through Zieliński and Cash before attempting the direct service into Lewandowski.",
        stepTitles: [
          "Krychowiak Protects the First Touch",
          "Zieliński Escapes Rabiot",
          "Cash Earns the Crossing Window"
        ],
        stepCaptions: [
          "Krychowiak secures the loose ball with his body between Griezmann and the recovery instead of forcing a blind clearance.",
          "Zieliński drops to receive on the half-turn and carries away from Rabiot toward the right sideline.",
          "Cash advances only after the outlet is stable, giving Lewandowski time to separate from Varane before the cross."
        ]
      }
    },

    "ENG|SEN": {
      recommendation: {
        player: "Jude Bellingham",
        plan: "Use Bellingham's carry through Gueye's outside shoulder to draw Diallo out, then release Saka into the gap behind Jakobs.",
        why: "Senegal's midfield protects the center aggressively, but a runner who breaks its first line can force the left center back away from Saka."
      },
      attack: {
        style: "central",
        flank: "right",
        tempo: 1.03,
        widthScale: 1.01,
        depthShift: 1,
        laneShift: 2,
        stagger: 0.7,
        intent: "Let Bellingham carry beyond Senegal's midfield screen and connect Kane's drop with Saka's run behind Jakobs.",
        stepTitles: [
          "Rice Clears Bellingham's Runway",
          "Kane Draws Koulibaly Forward",
          "Saka Enters Behind Jakobs",
          "Bellingham Threads Kane Between the Pair"
        ],
        stepCaptions: [
          "Rice holds beneath Gueye while Bellingham accelerates past the midfielder's outside shoulder on the right.",
          "Kane checks toward Bellingham and pulls Koulibaly a step away from Senegal's last line.",
          "Bellingham slips Saka between Jakobs and Diallo as Kane turns to attack the return cross.",
          "Bellingham disguises the final pass between Koulibaly and Diallo, releasing Kane for a first-time finish beyond Mendy."
        ]
      },
      press: {
        style: "high",
        flank: "left",
        tempo: 1.06,
        widthScale: 0.99,
        depthShift: 2,
        laneShift: -2,
        stagger: 0.8,
        intent: "Angle Senegal's buildup toward Diallo and Jakobs, then use Foden and Henderson to deny the release into Sarr.",
        stepTitles: [
          "Kane Separates the Center Backs",
          "Foden Triggers on Diallo",
          "Henderson Covers Sarr's Outlet",
          "Bellingham Attacks Diallo's Turnover"
        ],
        stepCaptions: [
          "Kane curves across Koulibaly to make Mendy's safest pass travel toward Diallo on Senegal's left.",
          "Foden accelerates as Diallo receives, with Bellingham stepping onto Gueye behind the first pressure.",
          "Henderson narrows onto Sarr's support lane while Walker holds depth against the forward's direct run.",
          "Bellingham takes the ball forced from Diallo and combines with Kane immediately while Senegal remains trapped near its box."
        ]
      },
      transition: {
        style: "secure",
        flank: "left",
        tempo: 0.98,
        widthScale: 1,
        depthShift: 0,
        laneShift: -1,
        stagger: -0.2,
        intent: "Protect the first pass from Senegal's athletic counterpress, then switch away from Sarr toward Foden and Shaw.",
        stepTitles: [
          "Rice Shelters the Regain",
          "Stones Bypasses Gueye",
          "Shaw Releases Foden"
        ],
        stepCaptions: [
          "Rice receives behind the duel and turns his body between Gueye and the ball to prevent an instant turnover.",
          "Stones steps into the next pass, drawing Dia inward before switching across Senegal's compact front.",
          "Shaw advances outside Foden, who receives inside Sabaly with Senegal's pressure stranded on the opposite side."
        ]
      }
    },

    "SEN|ENG": {
      recommendation: {
        player: "Ismaïla Sarr",
        plan: "Release Sarr early outside Shaw, then let him cut across Maguire while Dia occupies Stones on the far side.",
        why: "England's left back advances with possession, and Maguire is most uncomfortable when forced to turn toward his own goal in a wide channel."
      },
      attack: {
        style: "direct",
        flank: "right",
        tempo: 1.08,
        widthScale: 1.05,
        depthShift: 2,
        laneShift: 4,
        stagger: 1,
        intent: "Bypass England's midfield pressure and attack the space behind Shaw with Sarr before Maguire can shift across.",
        stepTitles: [
          "Koulibaly Breaks England's First Line",
          "Dia Occupies Stones",
          "Sarr Turns Maguire Toward Goal",
          "Gueye Attacks Dia's Knockdown"
        ],
        stepCaptions: [
          "Koulibaly carries beyond Kane's cover shadow and shapes a diagonal over Bellingham toward the right.",
          "Dia pins Stones in the central lane so England cannot release both center backs toward the direct ball.",
          "Sarr races behind Shaw, takes the pass outside, and then drives diagonally across Maguire's recovery path.",
          "Dia contests Sarr's delivery with Stones and Gueye beats Rice to the dropping second ball at the edge of England's box."
        ]
      },
      press: {
        style: "mid",
        flank: "left",
        tempo: 0.97,
        widthScale: 0.96,
        depthShift: -1,
        laneShift: -2,
        stagger: -0.3,
        intent: "Screen Rice with Dia, crowd Bellingham's receiving lane, and trigger only when Maguire passes toward Shaw.",
        stepTitles: [
          "Dia Hides Rice",
          "Gueye Tracks Bellingham's Check",
          "Sabaly Springs on Shaw",
          "Gueye Sends Sarr After the Regain"
        ],
        stepCaptions: [
          "Dia remains goal-side of Rice while allowing Stones and Maguire to circulate in front of Senegal's block.",
          "Gueye follows Bellingham only into the midfield line, preserving compactness beside Nampalys Mendy.",
          "Sarr curves inward on Maguire's pass and Sabaly jumps Shaw, leaving Koulibaly ready for Kane's direct outlet.",
          "Gueye recovers Shaw's pressured pass around halfway and releases Sarr through the center of England's stretched shape."
        ]
      },
      transition: {
        style: "counter",
        flank: "right",
        tempo: 1.12,
        widthScale: 1.06,
        depthShift: 3,
        laneShift: 4,
        stagger: 1.5,
        intent: "Turn Gueye's regain into a first-touch release for Sarr against England's advanced left side.",
        stepTitles: [
          "Gueye Strips the Inside Pass",
          "Dia Holds Stones Central",
          "Sarr Runs Beyond Shaw"
        ],
        stepCaptions: [
          "Gueye attacks Bellingham's forward touch and directs the recovery immediately toward Senegal's right.",
          "Dia stays between Stones and Maguire, preventing Stones from covering the wing without surrendering the center.",
          "Sarr accelerates outside Shaw and receives before Rice can foul or England can restore its defensive spacing."
        ]
      }
    },

    "JPN|CRO": {
      recommendation: {
        player: "Kaoru Mitoma",
        plan: "Keep Mitoma wide until Croatia shifts toward Doan, then isolate him against Juranović before Brozović can protect the channel.",
        why: "Croatia's midfield slides patiently but its right back can be exposed when the far-side wingback receives after a rapid switch."
      },
      attack: {
        style: "wing",
        flank: "left",
        tempo: 1.07,
        widthScale: 1.07,
        depthShift: 1,
        laneShift: -4,
        stagger: 0.9,
        intent: "Draw Croatia toward Doan on Japan's right before reversing quickly to give Mitoma a running duel with Juranović.",
        stepTitles: [
          "Doan Loads Croatia's Left",
          "Endo Reverses Through Morita",
          "Mitoma Isolates Juranović",
          "Mitoma Finds Kamada on the Cutback"
        ],
        stepCaptions: [
          "Doan and Ito combine near Sosa, pulling Kovačić and Perišić toward Japan's right-side circulation.",
          "Endo returns the ball through Morita before Brozović can slide across the center of Croatia's block.",
          "Mitoma receives on the move outside Juranović while Maeda pins Lovren and Kamada attacks the cutback.",
          "Mitoma beats Juranović to the byline and pulls behind Gvardiol for Kamada, with Endo positioned for Croatia's clearance."
        ]
      },
      press: {
        style: "mid",
        flank: "right",
        tempo: 1.02,
        widthScale: 0.97,
        depthShift: 0,
        laneShift: 2,
        stagger: 0.5,
        intent: "Let Gvardiol carry, remove Modrić with Kamada, and trap Lovren when Croatia's buildup reaches its right side.",
        stepTitles: [
          "Maeda Shows Gvardiol Across",
          "Kamada Locks onto Modrić",
          "Doan Closes Lovren's Exit",
          "Endo Launches Maeda After the Trap"
        ],
        stepCaptions: [
          "Maeda presses Gvardiol from Croatia's left, inviting the square pass rather than allowing a vertical drive.",
          "Kamada stays between Gvardiol and Modrić while Endo protects the lane into Kramarić.",
          "Doan jumps Lovren as Ito advances on Juranović, forcing a rushed pass beside the touchline.",
          "Endo claims Lovren's hurried pass near halfway and releases Maeda centrally before Brozović can halt Japan's break."
        ]
      },
      transition: {
        style: "counter",
        flank: "left",
        tempo: 1.11,
        widthScale: 1.05,
        depthShift: 3,
        laneShift: -4,
        stagger: 1.3,
        intent: "Exploit Juranović's advanced position by finding Mitoma immediately after Endo or Morita wins the midfield duel.",
        stepTitles: [
          "Endo Interrupts Modrić",
          "Maeda Pins Lovren",
          "Mitoma Attacks the Vacated Rail"
        ],
        stepCaptions: [
          "Endo steps across Modrić's receiver and nudges the loose ball toward Morita before Brozović arrives.",
          "Maeda runs across Lovren to stop the center back from covering Croatia's exposed right edge.",
          "Mitoma accelerates into Juranović's vacated lane and drives inside with Kamada supporting beneath him."
        ]
      }
    },

    "CRO|JPN": {
      recommendation: {
        player: "Luka Modrić",
        plan: "Use Modrić to draw Japan's right-side press, then reverse through Brozović for Perišić beyond Ito's recovery run.",
        why: "Japan shifts as a compact unit toward the ball, so Croatia's best opening appears on the far side before its wingback line can travel."
      },
      attack: {
        style: "buildup",
        flank: "left",
        tempo: 0.95,
        widthScale: 1.04,
        depthShift: 0,
        laneShift: -3,
        stagger: -0.5,
        intent: "Invite Japan's press onto Modrić and Juranović, then switch through Brozović to Perišić outside Ito.",
        stepTitles: [
          "Modrić Attracts Japan's Right Trap",
          "Brozović Opens the Far Door",
          "Perišić Arrives Beyond Ito",
          "Modrić Sends Perišić Behind Ito"
        ],
        stepCaptions: [
          "Modrić drops beside Lovren and exchanges with Juranović until Mitoma and Kamada commit toward the ball.",
          "Brozović receives behind Maeda's pressure and turns the circulation across Endo before Japan can reset.",
          "Perišić meets the switch outside Ito as Kramarić pins Yoshida and Sosa overlaps to preserve width.",
          "Modrić follows the switch with a first-time diagonal beyond Ito, sending Perišić into Japan's box beside Kramarić."
        ]
      },
      press: {
        style: "mid",
        flank: "right",
        tempo: 0.99,
        widthScale: 0.95,
        depthShift: 0,
        laneShift: 2,
        stagger: 0.2,
        intent: "Close Endo's central outlet and trigger Kramarić's jump when Japan sends the ball from Yoshida toward Tomiyasu.",
        stepTitles: [
          "Petković Screens Endo",
          "Kramarić Waits for Tomiyasu",
          "Juranović Squeezes Mitoma",
          "Modrić Releases Kramarić on the Regain"
        ],
        stepCaptions: [
          "Petković stands between Yoshida and Endo so Japan must begin its progression around Croatia's midfield triangle.",
          "Kramarić holds beside Tomiyasu until the pass travels, then presses from outside to remove the line toward Mitoma.",
          "Juranović advances into Mitoma while Modrić covers Morita and Gvardiol protects the channel behind them.",
          "Modrić collects the pass trapped near halfway and sends Kramarić through Japan's center before Endo can rebuild the screen."
        ]
      },
      transition: {
        style: "secure",
        flank: "right",
        tempo: 0.93,
        widthScale: 0.98,
        depthShift: -1,
        laneShift: 1,
        stagger: -0.8,
        intent: "Use Modrić and Brozović to survive Japan's immediate swarm before releasing Juranović beyond Mitoma.",
        stepTitles: [
          "Brozović Shields the Recovery",
          "Modrić Escapes Endo's Pressure",
          "Juranović Advances After Control"
        ],
        stepCaptions: [
          "Brozović collects the regain with his back to Kamada and lays it safely into Modrić's supporting angle.",
          "Modrić changes direction away from Endo and carries until Japan's first three pressers have been bypassed.",
          "Juranović advances only once possession is secure, receiving outside Mitoma with Kramarić available inside."
        ]
      }
    }
  };
});
