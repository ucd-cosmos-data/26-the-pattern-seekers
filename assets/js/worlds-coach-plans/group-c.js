(function (root, factory) {
    "use strict";

    var plans = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = plans;
    } else {
        root.WorldsCoachPlanGroups = root.WorldsCoachPlanGroups || [];
        root.WorldsCoachPlanGroups.push(plans);
    }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    return {
        "MAR|POR": {
            recommendation: {
                player: "Hakim Ziyech",
                plan: "Release Ziyech behind Guerreiro before Portugal can restore their back four",
                why: "Portugal's left-back advances to support the ball; Ziyech can receive the first outlet, draw Pepe across, and feed Hakimi or En-Nesyri into the space that opens."
            },
            attack: {
                style: "counter",
                flank: "right",
                tempo: 1.08,
                widthScale: 1.03,
                depthShift: -1,
                laneShift: 3,
                stagger: 0.8,
                intent: "Invite Portugal's creators forward, then break through Ziyech into the channel Guerreiro leaves.",
                stepTitles: [
                    "Invite Portugal onto Amrabat",
                    "Spring Ziyech behind Guerreiro",
                    "Hit En-Nesyri before Dias resets",
                    "Hakimi cuts back before Pepe can recover"
                ],
                stepCaptions: [
                    "Saïss and Amrabat circulate patiently until Bruno Fernandes and Bernardo Silva step beyond Portugal's holding midfielder.",
                    "Amrabat finds Ziyech early on Morocco's right, with Hakimi accelerating outside the retreating Guerreiro.",
                    "Ziyech delivers before Rúben Dias can set his feet while En-Nesyri attacks the gap between Dias and Pepe.",
                    "Hakimi reaches the byline and pulls the ball toward En-Nesyri before Pepe and Rúben Dias can restore Portugal's box shape."
                ]
            },
            press: {
                style: "low",
                flank: "left",
                tempo: 0.94,
                widthScale: 0.96,
                depthShift: -3,
                laneShift: -2,
                stagger: -0.6,
                intent: "Protect Amrabat's central screen and make Portugal build through their least dangerous wide circulation.",
                stepTitles: [
                    "Seal Bruno's central pocket",
                    "Show Pepe toward the touchline",
                    "Collapse on Portugal's square pass",
                    "Saïss clears Ronaldo's delivery and resets"
                ],
                stepCaptions: [
                    "En-Nesyri screens the pivot while Ounahi and Amallah stay connected around Bruno Fernandes between the lines.",
                    "The block concedes Pepe's outside carry but keeps Bernardo Silva and João Félix on the far side of Amrabat.",
                    "Boufal jumps the square pass as Attiat-Allah steps out and Saïss protects the channel behind them.",
                    "Saïss attacks the eventual cross ahead of Cristiano Ronaldo, clears beyond Bruno Fernandes, and leads Morocco's two banks out together."
                ]
            },
            transition: {
                style: "counter",
                flank: "right",
                tempo: 1.11,
                widthScale: 1.05,
                depthShift: 2,
                laneShift: 4,
                stagger: 1.2,
                intent: "Turn Amrabat's regain into a three-pass right-channel counter before Portugal can counterpress.",
                stepTitles: [
                    "Amrabat claims Portugal's loose pass",
                    "Hakimi bursts beyond Guerreiro",
                    "En-Nesyri pins Dias at full speed"
                ],
                stepCaptions: [
                    "Amrabat wins or gathers the second ball and immediately faces forward instead of accepting a reset pass.",
                    "Ziyech receives to feet and releases Hakimi outside the recovering Portugal left-back.",
                    "En-Nesyri occupies Rúben Dias as Hakimi chooses an early cross or a cutback for the arriving Ounahi."
                ]
            }
        },

        "POR|MAR": {
            recommendation: {
                player: "Bruno Fernandes",
                plan: "Let Bruno move Morocco's midfield before switching Cancelo behind Attiat-Allah",
                why: "Morocco's narrow screen is hardest to break head-on; Bruno can pull Ounahi inward, reverse the point of attack, and create a right-side delivery before Saïss can slide across."
            },
            attack: {
                style: "buildup",
                flank: "right",
                tempo: 0.98,
                widthScale: 1.08,
                depthShift: 1,
                laneShift: 2,
                stagger: -0.4,
                intent: "Shift Morocco's 4-1-4-1 twice, then find Cancelo outside their left midfielder.",
                stepTitles: [
                    "Fix Amrabat with Bernardo",
                    "Reverse play through Bruno",
                    "Send Cancelo beyond Attiat-Allah",
                    "Bruno bends the far-side diagonal behind Morocco"
                ],
                stepCaptions: [
                    "Bernardo Silva drifts beside Amrabat while Rúben Neves holds beneath the ball and prevents Morocco from pressing both pivots.",
                    "Bruno Fernandes drops into the opposite half-space to receive the return pass as Morocco's midfield finishes its first slide.",
                    "Bruno switches quickly to Cancelo, whose early delivery reaches Gonçalo Ramos before Saïss and El Yamiq can re-form.",
                    "Bruno's first-time diagonal completes the switch by releasing Cancelo beyond Attiat-Allah to attack Morocco's box from the far side."
                ]
            },
            press: {
                style: "mid",
                flank: "right",
                tempo: 1.01,
                widthScale: 0.98,
                depthShift: 0,
                laneShift: 3,
                stagger: 0.5,
                intent: "Screen Amrabat, guide Bono toward Morocco's left, and trap the pass into Attiat-Allah.",
                stepTitles: [
                    "Ramos hides Amrabat",
                    "Bruno steers Bono toward El Yamiq",
                    "Cancelo locks Attiat-Allah to the line",
                    "Bruno releases Ramos through Morocco's open centre"
                ],
                stepCaptions: [
                    "Gonçalo Ramos starts between the centre-backs and keeps Amrabat in his cover shadow rather than chasing Bono.",
                    "Bruno Fernandes closes the return lane to Saïss so Bono's safer exit runs toward El Yamiq on Morocco's left.",
                    "Cancelo jumps Attiat-Allah while Bernardo blocks Ounahi's inside support and Rúben Dias covers En-Nesyri.",
                    "Portugal secure the touchline regain and Bruno immediately sends Ramos between Morocco's separated midfield and centre-backs."
                ]
            },
            transition: {
                style: "secure",
                flank: "left",
                tempo: 0.92,
                widthScale: 0.95,
                depthShift: -2,
                laneShift: -3,
                stagger: -1.0,
                intent: "Close Ziyech's first outlet and retain enough cover to stop Hakimi joining Morocco's break.",
                stepTitles: [
                    "Neves guards Ziyech's passing lane",
                    "Dias anchors against En-Nesyri",
                    "Guerreiro offers the safe escape"
                ],
                stepCaptions: [
                    "On loss, Rúben Neves moves goal-side of Ziyech's inside route while the nearest attacker delays Amrabat.",
                    "Rúben Dias stays attached to En-Nesyri instead of following the ball, with Pepe protecting the space behind.",
                    "If the immediate counterpress is not clean, Portugal recover possession through Guerreiro and rebuild away from Hakimi."
                ]
            }
        },

        "ENG|FRA": {
            recommendation: {
                player: "Bukayo Saka",
                plan: "Build the right-side triangle that frees Saka to attack Hernández one-on-one",
                why: "Henderson and Bellingham can occupy Rabiot and Mbappé's recovery lane, leaving Saka to receive outside Hernández while Kane pins France's nearest centre-back."
            },
            attack: {
                style: "wing",
                flank: "right",
                tempo: 1.04,
                widthScale: 1.05,
                depthShift: 1,
                laneShift: 3,
                stagger: 0.7,
                intent: "Use England's midfield rotations to isolate Saka against Hernández without exposing Walker to Mbappé.",
                stepTitles: [
                    "Henderson draws Rabiot inside",
                    "Bellingham releases Saka outside",
                    "Kane attacks Saka's cutback",
                    "Saka cuts back for Bellingham behind Tchouaméni"
                ],
                stepCaptions: [
                    "Henderson moves into the right half-space and Bellingham advances centrally, forcing Rabiot to choose between two receivers.",
                    "Saka holds the touchline until Bellingham turns, while Walker stays beneath the ball to preserve cover against Mbappé.",
                    "Saka drives at Hernández and cuts the ball behind Varane for Kane, with Bellingham arriving beyond Tchouaméni.",
                    "From the byline Saka pulls the final ball away from Varane, finding Bellingham's late run behind Tchouaméni beside Kane."
                ]
            },
            press: {
                style: "mid",
                flank: "left",
                tempo: 1.00,
                widthScale: 0.96,
                depthShift: -1,
                laneShift: -3,
                stagger: -0.3,
                intent: "Deny Griezmann's roaming lane, then spring the press when France build into Hernández under pressure.",
                stepTitles: [
                    "Rice shadows Griezmann",
                    "Kane permits the pass to Hernández",
                    "Walker and Henderson close Mbappé's exit",
                    "Bellingham drives through France after the trap"
                ],
                stepCaptions: [
                    "Rice stays connected to Griezmann's zone while Kane curves his position to screen Tchouaméni from the centre-backs.",
                    "England leave Hernández apparently available, using the pass toward France's left as the collective trigger.",
                    "Saka presses backward, Henderson seals Rabiot, and Walker holds a covering distance that prevents Mbappé escaping down the line.",
                    "England turn the halfway-line regain into a central break, with Bellingham carrying past Rabiot and releasing Kane before France recover."
                ]
            },
            transition: {
                style: "swarm",
                flank: "left",
                tempo: 1.09,
                widthScale: 0.97,
                depthShift: -1,
                laneShift: -4,
                stagger: 1.1,
                intent: "Counterpress the central loss while Walker and Rice immediately remove Mbappé's route into open grass.",
                stepTitles: [
                    "Bellingham attacks the loose ball",
                    "Rice blocks Griezmann's release",
                    "Walker races goal-side of Mbappé"
                ],
                stepCaptions: [
                    "Bellingham and Henderson squeeze the turnover from opposite sides so France cannot lift their first pass cleanly.",
                    "Rice protects the central lane into Griezmann, forcing the regain toward France's crowded left side.",
                    "Walker drops before the pass is played and shows Mbappé toward the touchline while Stones guards Giroud."
                ]
            }
        },

        "FRA|ENG": {
            recommendation: {
                player: "Kylian Mbappé",
                plan: "Pair Mbappé with Hernández so Walker must defend two different depths",
                why: "Griezmann can pull England's right-sided midfielder inward; Hernández then overlaps outside Walker as Mbappé attacks the seam between Walker and Stones."
            },
            attack: {
                style: "wingback",
                flank: "left",
                tempo: 1.07,
                widthScale: 1.04,
                depthShift: 2,
                laneShift: -3,
                stagger: 1.0,
                intent: "Overload Walker with Mbappé's inside run, Hernández's overlap, and Griezmann's delayed support.",
                stepTitles: [
                    "Griezmann pulls Henderson inward",
                    "Hernández races outside Walker",
                    "Mbappé attacks the Walker-Stones seam",
                    "Hernández crosses for Giroud and the far runner"
                ],
                stepCaptions: [
                    "Griezmann drops toward Tchouaméni and draws Henderson away from the space England need to double Mbappé.",
                    "Mbappé receives inside and holds Walker for a beat as Hernández accelerates beyond him on France's left.",
                    "Hernández's run stretches the line and Mbappé darts between Walker and Stones for Griezmann's disguised return pass.",
                    "Hernández reaches the crossing lane for Giroud's central run while France's far-side attacker arrives beyond Shaw at the back post."
                ]
            },
            press: {
                style: "mid",
                flank: "right",
                tempo: 0.99,
                widthScale: 0.95,
                depthShift: 0,
                laneShift: 2,
                stagger: -0.8,
                intent: "Keep England away from Saka and bait their build toward Shaw before compressing the touchline.",
                stepTitles: [
                    "Giroud screens Rice",
                    "Dembélé leaves Shaw as the bait",
                    "Koundé closes Foden's inside return",
                    "Griezmann sends Mbappé through England's open middle"
                ],
                stepCaptions: [
                    "Giroud positions between Stones and Rice while Griezmann blocks Bellingham's easy reception beyond the pivot.",
                    "France shade toward Saka's side and allow the slower diagonal toward Shaw to begin the trap.",
                    "Dembélé jumps Shaw, Koundé steps into Foden, and Tchouaméni protects against Bellingham breaking through the middle.",
                    "After France win the trapped pass near halfway, Griezmann turns centrally and releases Mbappé before Rice can reconnect with Stones."
                ]
            },
            transition: {
                style: "counter",
                flank: "left",
                tempo: 1.12,
                widthScale: 1.06,
                depthShift: 3,
                laneShift: -4,
                stagger: 1.4,
                intent: "Find Mbappé behind England's advanced right side before Rice can rebuild the screen.",
                stepTitles: [
                    "Tchouaméni wins beneath Bellingham",
                    "Griezmann turns through Rice's blind side",
                    "Mbappé accelerates beyond Walker"
                ],
                stepCaptions: [
                    "Tchouaméni secures the turnover and plays forward before England's nearest midfielders can surround him.",
                    "Griezmann receives on Rice's far shoulder and takes one touch to face England's retreating centre-backs.",
                    "Mbappé starts wide, then races diagonally behind Walker as Giroud pins Stones and opens the passing window."
                ]
            }
        },

        "ARG|CRO": {
            recommendation: {
                player: "Julián Álvarez",
                plan: "Send Álvarez directly at Lovren before Croatia's midfield can recover",
                why: "Messi's dropping movement can draw Brozović out; an early vertical release then turns Álvarez's pace against Lovren instead of letting Modrić and Kovačić control another possession."
            },
            attack: {
                style: "direct",
                flank: "right",
                tempo: 1.10,
                widthScale: 0.97,
                depthShift: 2,
                laneShift: 2,
                stagger: 1.3,
                intent: "Bypass Croatia's midfield triangle and attack Lovren's channel with Álvarez running from Messi's pass.",
                stepTitles: [
                    "Messi drags Brozović forward",
                    "De Paul punches through Croatia's line",
                    "Álvarez races across Lovren",
                    "Mac Allister attacks Lovren's headed second ball"
                ],
                stepCaptions: [
                    "Messi drops toward the right half-space, inviting Brozović to leave the zone in front of Croatia's centre-backs.",
                    "De Paul receives below Modrić and immediately finds Messi beyond the first pressure instead of circulating across Croatia.",
                    "Messi releases Álvarez diagonally into Lovren's outside shoulder while Mac Allister occupies Gvardiol.",
                    "When Lovren contests the early delivery with Álvarez, Mac Allister arrives first at the knock-down on Croatia's box edge."
                ]
            },
            press: {
                style: "mid",
                flank: "left",
                tempo: 1.03,
                widthScale: 0.94,
                depthShift: 0,
                laneShift: -2,
                stagger: 0.2,
                intent: "Screen Brozović, crowd Modrić's receiving side, and make Gvardiol carry toward Argentina's prepared trap.",
                stepTitles: [
                    "Álvarez hides Brozović",
                    "Messi angles the ball toward Gvardiol",
                    "De Paul squeezes Modrić's return lane",
                    "Messi carries the regain beyond Croatia's midfield"
                ],
                stepCaptions: [
                    "Álvarez starts close enough to Lovren to curve his run across the direct pass into Brozović.",
                    "Messi preserves energy but blocks the switch, encouraging Croatia to progress through Gvardiol on their left.",
                    "De Paul and Enzo compress around Modrić while Molina holds Perišić and Romero protects the depth behind them.",
                    "Argentina win inside the mid-block and Messi drives through the stretched centre before releasing Álvarez between Lovren and Gvardiol."
                ]
            },
            transition: {
                style: "counter",
                flank: "right",
                tempo: 1.12,
                widthScale: 1.00,
                depthShift: 3,
                laneShift: 3,
                stagger: 1.5,
                intent: "Use Messi's first forward touch to launch Álvarez before Gvardiol can cover across.",
                stepTitles: [
                    "Enzo steals Croatia's second pass",
                    "Messi receives beyond Kovačić",
                    "Álvarez attacks Lovren's turning side"
                ],
                stepCaptions: [
                    "Enzo steps into the square midfield pass while De Paul prevents Modrić from counterpressing the regain.",
                    "The first outlet finds Messi between Croatia's midfield and defence with his body already open toward goal.",
                    "Álvarez curves into the right channel, forcing Lovren to turn while Mac Allister delays Gvardiol's cover."
                ]
            }
        },

        "CRO|ARG": {
            recommendation: {
                player: "Luka Modrić",
                plan: "Use Modrić to escape De Paul and switch Perišić behind Molina",
                why: "Argentina overload Messi's side and leave Molina high; Modrić can evade the first jump, draw Enzo across, and expose that space with one diagonal to Perišić."
            },
            attack: {
                style: "buildup",
                flank: "left",
                tempo: 0.96,
                widthScale: 1.06,
                depthShift: 0,
                laneShift: -3,
                stagger: -0.7,
                intent: "Circulate through Modrić until Argentina narrow, then switch Perišić into Molina's vacated lane.",
                stepTitles: [
                    "Brozović anchors Argentina's front two",
                    "Modrić spins away from De Paul",
                    "Perišić receives beyond Molina",
                    "Perišić completes Modrić's diagonal behind Molina"
                ],
                stepCaptions: [
                    "Brozović drops beside the centre-backs to give Croatia a spare player against Messi and Álvarez without forcing the pass.",
                    "Kovačić attracts Enzo before Modrić receives on De Paul's outside shoulder and opens the far side.",
                    "Modrić's diagonal reaches Perišić behind Molina, with Sosa overlapping and Kramarić arriving between Argentina's centre-backs.",
                    "The far-side switch becomes an immediate ball in behind for Perišić, who enters Argentina's box before Romero can cover Molina."
                ]
            },
            press: {
                style: "mid",
                flank: "right",
                tempo: 0.95,
                widthScale: 0.95,
                depthShift: -2,
                laneShift: 3,
                stagger: -1.1,
                intent: "Crowd Messi's right half-space without pulling Gvardiol out of Croatia's covering line.",
                stepTitles: [
                    "Brozović blocks the lane into Messi",
                    "Perišić sends Romero toward Molina",
                    "Kovačić doubles De Paul from inside",
                    "Kovačić releases Kramarić through Argentina's centre"
                ],
                stepCaptions: [
                    "Brozović stays between Messi and goal while Modrić positions close enough to discourage Enzo's vertical pass.",
                    "Croatia allow Romero to carry outward, then Perišić bends his pressure to prevent the pass back through midfield.",
                    "Kovačić closes De Paul as Juranović steps toward Molina and Gvardiol remains free to cover Álvarez.",
                    "Croatia secure the mid-block turnover and Kovačić immediately sends Kramarić through the centre before Enzo can recover."
                ]
            },
            transition: {
                style: "secure",
                flank: "left",
                tempo: 0.90,
                widthScale: 0.96,
                depthShift: -3,
                laneShift: -2,
                stagger: -1.4,
                intent: "Retain a compact base around Brozović so Messi cannot turn Croatia's attacking loss into an Álvarez sprint.",
                stepTitles: [
                    "Brozović protects Messi's receiving zone",
                    "Gvardiol tracks Álvarez without diving in",
                    "Modrić becomes Croatia's safe outlet"
                ],
                stepCaptions: [
                    "As the ball is lost, Brozović drops into Messi's route and the nearest winger delays Argentina's first touch.",
                    "Gvardiol matches Álvarez's run while Lovren holds the box, keeping both centre-backs from chasing the same threat.",
                    "On regain, Croatia find Modrić away from De Paul and use his control to escape rather than forcing an exposed counter."
                ]
            }
        },

        "FRA|MAR": {
            recommendation: {
                player: "Ousmane Dembélé",
                plan: "Isolate Dembélé after Mbappé has drawn Morocco's block toward Hakimi",
                why: "Morocco protect Mbappé's flank with Hakimi and Amrabat; a fast switch leaves Dembélé against Attiat-Allah before Saïss can move across to support him."
            },
            attack: {
                style: "wing",
                flank: "right",
                tempo: 1.06,
                widthScale: 1.08,
                depthShift: 2,
                laneShift: 4,
                stagger: 0.9,
                intent: "Draw Morocco toward Mbappé, reverse through Griezmann, and isolate Dembélé against Attiat-Allah.",
                stepTitles: [
                    "Mbappé pins Hakimi deep",
                    "Griezmann reverses beyond Amrabat",
                    "Dembélé attacks Attiat-Allah alone",
                    "Dembélé cuts back beyond Amrabat for Griezmann"
                ],
                stepCaptions: [
                    "Mbappé and Hernández occupy Morocco's right side while Giroud fixes Saïss and prevents the back line sliding early.",
                    "Griezmann drops beside Tchouaméni, receives outside Amrabat's cover, and turns the ball toward France's weak side.",
                    "Dembélé drives inside Attiat-Allah as Koundé overlaps and Giroud attacks the channel beside El Yamiq.",
                    "Dembélé reaches Morocco's byline and pulls the ball behind Saïss for Griezmann's late arrival beyond Amrabat."
                ]
            },
            press: {
                style: "high",
                flank: "left",
                tempo: 1.07,
                widthScale: 0.97,
                depthShift: 2,
                laneShift: -3,
                stagger: 0.6,
                intent: "Remove Amrabat from Morocco's first pass and force Bono to play into France's left-side pressing cage.",
                stepTitles: [
                    "Giroud screens Amrabat from Bono",
                    "Griezmann curves toward Saïss",
                    "Hernández traps Ziyech's inside support",
                    "Griezmann attacks the regain before Saïss resets"
                ],
                stepCaptions: [
                    "Giroud begins on Amrabat's line while Dembélé and Mbappé narrow enough to discourage Bono's direct passes into midfield.",
                    "Griezmann jumps Saïss on the goalkeeper's release and uses his run to block the return pass across Morocco's box.",
                    "Hernández steps hard toward Ziyech as Rabiot closes Ounahi, leaving Varane ready for the direct ball to En-Nesyri.",
                    "France win inside Morocco's final third and Griezmann attacks the exposed goal before Saïss and Amrabat can rebuild the block."
                ]
            },
            transition: {
                style: "counter",
                flank: "left",
                tempo: 1.12,
                widthScale: 1.07,
                depthShift: 3,
                laneShift: -4,
                stagger: 1.5,
                intent: "Exploit the space behind Hakimi with Mbappé before Morocco's five-man recovery line is restored.",
                stepTitles: [
                    "Rabiot wins ahead of Ziyech",
                    "Griezmann releases the first touch",
                    "Mbappé breaks into Hakimi's channel"
                ],
                stepCaptions: [
                    "Rabiot gathers the loose ball on Morocco's right and immediately finds Griezmann between Amrabat and the retreating defence.",
                    "Griezmann plays forward in one touch so Saïss cannot delay France while Hakimi recovers from his attacking position.",
                    "Mbappé runs outside Saïss into the lane Hakimi left, with Giroud occupying El Yamiq and Hernández supporting beneath."
                ]
            }
        },

        "MAR|FRA": {
            recommendation: {
                player: "Hakim Ziyech",
                plan: "Join Ziyech with Hakimi to attack the space behind Hernández",
                why: "Mbappé offers limited recovery on France's left; Ziyech can draw Rabiot outward, combine with Hakimi, and deliver before Varane shifts across to En-Nesyri."
            },
            attack: {
                style: "wingback",
                flank: "right",
                tempo: 1.04,
                widthScale: 1.05,
                depthShift: 1,
                laneShift: 4,
                stagger: 1.1,
                intent: "Create a Ziyech-Hakimi overload in the space between Mbappé's recovery lane and Hernández.",
                stepTitles: [
                    "Ounahi draws Rabiot toward midfield",
                    "Ziyech receives behind Mbappé",
                    "Hakimi overlaps Hernández at pace",
                    "Hakimi crosses for En-Nesyri and Boufal"
                ],
                stepCaptions: [
                    "Ounahi carries across Amrabat and forces Rabiot to leave the lane France need to support Hernández.",
                    "Ziyech holds a high inside position behind Mbappé and turns before Tchouaméni can slide across.",
                    "Hakimi surges outside Hernández while En-Nesyri pins Varane and Boufal attacks the far-post space.",
                    "Hakimi delivers from the byline toward En-Nesyri's central run as Boufal attacks beyond Koundé at the back post."
                ]
            },
            press: {
                style: "low",
                flank: "right",
                tempo: 0.93,
                widthScale: 0.94,
                depthShift: -3,
                laneShift: 2,
                stagger: -0.9,
                intent: "Close Griezmann's central roaming space and invite France to circulate through Koundé away from Mbappé.",
                stepTitles: [
                    "Amrabat owns Griezmann's pocket",
                    "En-Nesyri screens Tchouaméni",
                    "Ziyech jumps Koundé's heavy touch",
                    "Saïss clears Giroud's cross and steps Morocco out"
                ],
                stepCaptions: [
                    "Amrabat protects the zone in front of Morocco's centre-backs while Ounahi tracks Griezmann's movement from the side.",
                    "En-Nesyri stays between France's centre-backs and Tchouaméni, conceding the slower outside pass toward Koundé.",
                    "Ziyech presses only when Koundé receives facing his own goal, with Hakimi closing Dembélé and Saïss covering behind.",
                    "Saïss beats Giroud to France's eventual cross, clears beyond Griezmann, and commands Morocco's compact block to advance."
                ]
            },
            transition: {
                style: "counter",
                flank: "right",
                tempo: 1.11,
                widthScale: 1.04,
                depthShift: 3,
                laneShift: 3,
                stagger: 1.3,
                intent: "Move the regain through Ounahi and Ziyech before Hernández can recover beside France's centre-backs.",
                stepTitles: [
                    "Amrabat turns away from Griezmann",
                    "Ounahi carries past Rabiot's pressure",
                    "Ziyech sends Hakimi into France's left"
                ],
                stepCaptions: [
                    "Amrabat receives the regain side-on and uses his first touch to escape Griezmann instead of clearing without a target.",
                    "Ounahi advances through the inside-right lane, compelling Rabiot to step and opening Ziyech outside him.",
                    "Ziyech releases Hakimi behind Hernández while En-Nesyri runs across Varane to create the crossing channel."
                ]
            }
        },

        "ARG|FRA": {
            recommendation: {
                player: "Lionel Messi",
                plan: "Build a 3-2-5, then let Messi release Molina through France's left",
                why: "De Paul can draw Rabiot into the right half-space while Messi fixes Hernández inside; Molina's overlap then creates the low cutback for Álvarez or Mac Allister."
            },
            attack: {
                style: "wingback",
                flank: "right",
                tempo: 1.02,
                widthScale: 1.05,
                depthShift: 1,
                laneShift: 3,
                stagger: 0.8,
                intent: "Reproduce Argentina's five-lane structure and build the Messi-De Paul-Molina overload against France's left.",
                stepTitles: [
                    "Romero carries into France's first line",
                    "Messi and De Paul create the right-side three",
                    "Molina cuts back behind Hernández",
                    "Molina crosses for Álvarez and Di María"
                ],
                stepCaptions: [
                    "Tagliafico stays in the back three as Romero advances and Enzo remains available beneath France's first pressure.",
                    "De Paul receives between Rabiot and Hernández, Messi drops alongside him, and Molina holds the outside lane.",
                    "Messi releases Molina toward the byline while Álvarez pins Upamecano and Mac Allister arrives beyond Tchouaméni.",
                    "Molina delivers across France's last line for Álvarez near Upamecano and Di María arriving beyond Koundé at the far post."
                ]
            },
            press: {
                style: "high",
                flank: "right",
                tempo: 1.05,
                widthScale: 0.96,
                depthShift: 1,
                laneShift: 2,
                stagger: 0.4,
                intent: "Trigger on France's backward pass, screen Tchouaméni, and lock the build toward Koundé.",
                stepTitles: [
                    "Álvarez and Messi set the 4-4-2",
                    "Lloris's return pass starts the chase",
                    "Di María seals Koundé at the line",
                    "Messi attacks the turnover before France expands"
                ],
                stepCaptions: [
                    "Álvarez positions on Tchouaméni's passing lane while Messi blocks the easy switch between France's centre-backs.",
                    "When Upamecano returns the ball to Lloris, both forwards advance and the midfield four squeeze behind them.",
                    "Álvarez curves his run to keep Tchouaméni screened as Di María closes Koundé and Argentina trap France's right side.",
                    "Argentina win Koundé's trapped pass high and Messi drives at goal before Tchouaméni or Varane can expand France's shape."
                ]
            },
            transition: {
                style: "swarm",
                flank: "right",
                tempo: 1.10,
                widthScale: 0.98,
                depthShift: 0,
                laneShift: 3,
                stagger: 1.0,
                intent: "Send five players to the loss while a disciplined 3+2 removes Mbappé's first counterattacking lane.",
                stepTitles: [
                    "Five protect behind Argentina's attack",
                    "Five close the blocked cutback",
                    "Messi re-releases Molina after the regain"
                ],
                stepCaptions: [
                    "Tagliafico, Otamendi, and Romero hold behind Enzo and De Paul so France cannot find Mbappé with one pass.",
                    "Messi, Molina, Álvarez, Mac Allister, and the nearest midfielder surround the loose ball for five seconds.",
                    "Once Messi recovers possession, Molina immediately attacks the same right channel before France can expand again."
                ]
            }
        },

        "FRA|ARG": {
            recommendation: {
                player: "Antoine Griezmann",
                plan: "Use Griezmann's decoy drop to release Mbappé behind Molina",
                why: "Griezmann can pull Enzo toward the ball while Giroud fixes Otamendi; Mbappé then attacks the gap outside Romero before Argentina's 3+2 rest defence can slide across."
            },
            attack: {
                style: "counter",
                flank: "left",
                tempo: 1.11,
                widthScale: 1.04,
                depthShift: 3,
                laneShift: -4,
                stagger: 1.4,
                intent: "Draw Enzo with Griezmann and strike immediately into Mbappé's channel behind the advancing Molina.",
                stepTitles: [
                    "Giroud fixes Otamendi centrally",
                    "Griezmann pulls Enzo off the screen",
                    "Mbappé attacks outside Romero",
                    "Mbappé cuts back for Griezmann before Romero recovers"
                ],
                stepCaptions: [
                    "Giroud stays between Argentina's centre-backs so Otamendi cannot leave the line to help on France's left.",
                    "Griezmann drops toward the regain and takes Enzo with him, creating a clear diagonal beyond Argentina's midfield.",
                    "Mbappé starts wide of Molina, then accelerates between Molina and Romero for Griezmann's first-time release.",
                    "Mbappé reaches the byline and pulls the ball centrally for Griezmann before Romero and Enzo can recover into Argentina's box."
                ]
            },
            press: {
                style: "mid",
                flank: "right",
                tempo: 1.00,
                widthScale: 0.94,
                depthShift: -1,
                laneShift: 3,
                stagger: -0.5,
                intent: "Deny Messi and De Paul on Argentina's right while steering their build toward Tagliafico.",
                stepTitles: [
                    "Rabiot crowds Messi's reception lane",
                    "Giroud blocks Enzo from Otamendi",
                    "Dembélé springs onto Tagliafico",
                    "Griezmann releases Mbappé through Argentina's centre"
                ],
                stepCaptions: [
                    "Rabiot stays close to Messi's half-space and Hernández holds Molina, preventing Argentina's preferred right-side triangle.",
                    "Giroud curves toward Otamendi with Enzo behind his cover shadow while Griezmann watches De Paul's movement.",
                    "France allow the pass toward Tagliafico, then Dembélé closes outside-in as Koundé guards Di María's return lane.",
                    "France secure the mid-block regain and Griezmann immediately sends Mbappé between Argentina's separated midfield and defence."
                ]
            },
            transition: {
                style: "counter",
                flank: "left",
                tempo: 1.12,
                widthScale: 1.08,
                depthShift: 3,
                laneShift: -4,
                stagger: 1.5,
                intent: "Turn Tchouaméni's recovery into a two-touch Griezmann-to-Mbappé break before Argentina can foul or reset.",
                stepTitles: [
                    "Tchouaméni intercepts behind Messi",
                    "Griezmann receives beyond De Paul",
                    "Mbappé outruns Argentina's right cover"
                ],
                stepCaptions: [
                    "Tchouaméni collects the loose pass behind Messi while Rabiot prevents De Paul from counterpressing through the centre.",
                    "Griezmann opens his body on the first touch and faces the space outside Romero before Enzo can recover.",
                    "Mbappé sprints beyond Molina as Giroud pins Otamendi, giving Griezmann a direct channel for the release."
                ]
            }
        }
    };
}));
