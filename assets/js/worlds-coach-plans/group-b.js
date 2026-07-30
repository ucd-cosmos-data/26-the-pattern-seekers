(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.WorldsCoachPlanGroups = root.WorldsCoachPlanGroups || [];
  root.WorldsCoachPlanGroups.push(factory());
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    "BRA|KOR": {
      recommendation: {
        player: "Vinícius Jr",
        plan: "Overload Korea's right, then release Vinícius Jr behind Kim Moon-hwan before the cover can slide.",
        why: "Korea's midfield narrows toward Neymar, leaving its right-back isolated against a delayed wide run."
      },
      attack: {
        style: "wing",
        flank: "left",
        tempo: 1.08,
        widthScale: 1.06,
        depthShift: 2,
        laneShift: -2,
        stagger: 0.8,
        intent: "Brazil draw Korea inward with Paquetá and Neymar before accelerating Vinícius Jr outside Kim Moon-hwan.",
        stepTitles: [
          "Pin Korea's right-back",
          "Paquetá bounces inside",
          "Vinícius cuts behind",
          "Richarlison meets Korea's cutback"
        ],
        stepCaptions: [
          "Vinícius Jr stays wide while Richarlison pins the near centre-back and prevents early cover.",
          "Lucas Paquetá plays through Neymar to pull Hwang In-beom away from Korea's right channel.",
          "The return pass releases Vinícius Jr behind Kim Moon-hwan for a cutback rather than a floated cross.",
          "Vinícius Jr pulls low toward Richarlison as Lucas Paquetá arrives behind Korea's collapsing centre-backs."
        ]
      },
      press: {
        style: "high",
        flank: "right",
        tempo: 1.1,
        widthScale: 1,
        depthShift: 3,
        laneShift: 2,
        stagger: 0.5,
        intent: "Brazil lock Korea's first pass on the flank and keep Casemiro goal-side of Son Heung-min.",
        stepTitles: [
          "Raphinha closes Jin-su",
          "Paquetá jumps In-beom",
          "Casemiro cages Son",
          "Paquetá attacks Korea's turnover"
        ],
        stepCaptions: [
          "Raphinha curves his run to remove the easy return while steering Kim Jin-su toward the sideline.",
          "Lucas Paquetá attacks Hwang In-beom's reception as Neymar screens Korea's central release.",
          "Casemiro protects the space beneath the press so Son Heung-min cannot turn a hurried clearance into a break.",
          "Lucas Paquetá claims the trapped ball and feeds Richarlison before Korea can expand from the touchline."
        ]
      },
      transition: {
        style: "swarm",
        flank: "left",
        tempo: 1.12,
        widthScale: 1.02,
        depthShift: 1,
        laneShift: -1,
        stagger: 0.3,
        intent: "Brazil counterpress the left-sided loss long enough for Neymar to recover the first forward outlet.",
        stepTitles: [
          "Collapse on In-beom",
          "Neymar finds the outlet",
          "Recover beneath Son"
        ],
        stepCaptions: [
          "Paquetá, Vinícius Jr and the nearest full-back close the ball before Hwang In-beom can face forward.",
          "Neymar occupies the escape lane and becomes the immediate target when the loose ball is recovered.",
          "Casemiro and Marquinhos hold a staggered rest defence to stop an early pass toward Son Heung-min."
        ]
      }
    },

    "KOR|BRA": {
      recommendation: {
        player: "Son Heung-min",
        plan: "Launch Son Heung-min into the channel behind Brazil's right-back while Gue-Sung Cho occupies Marquinhos.",
        why: "Brazil commit numbers around the ball, so their far-side recovery depends on a centre-back winning open-field races."
      },
      attack: {
        style: "counter",
        flank: "left",
        tempo: 1.1,
        widthScale: 1.04,
        depthShift: 1,
        laneShift: -3,
        stagger: 1.1,
        intent: "Korea bait Brazil forward on the right before sending Son Heung-min diagonally into the vacated outside channel.",
        stepTitles: [
          "Lure Brazil's right side",
          "Son leaves the touchline",
          "Cho occupies Marquinhos",
          "Son cuts back for Cho"
        ],
        stepCaptions: [
          "Kim Moon-hwan and Hwang In-beom exchange short passes until Brazil's wide press steps beyond the ball.",
          "Son Heung-min begins inside, then curves outside the advancing full-back as the pass is prepared.",
          "Gue-Sung Cho pins Marquinhos centrally, leaving Son a clean lane to carry or square across goal.",
          "Son Heung-min reaches the byline before Brazil recover and cuts the finish back toward Gue-Sung Cho."
        ]
      },
      press: {
        style: "mid",
        flank: "right",
        tempo: 0.98,
        widthScale: 0.96,
        depthShift: -1,
        laneShift: 2,
        stagger: -0.4,
        intent: "Korea protect the centre from Neymar and spring only when Brazil play a square pass toward their left.",
        stepTitles: [
          "Cho shades Casemiro",
          "Lee jumps the square pass",
          "Compact around Neymar",
          "Son breaks after the regain"
        ],
        stepCaptions: [
          "Gue-Sung Cho stays between the ball and Casemiro rather than chasing Brazil's centre-backs.",
          "Jae-Sung Lee accelerates when the pass travels wide, using the touchline as a second defender.",
          "Hwang In-beom and Jung Woo-young squeeze Neymar's receiving pocket while the back line stays compact.",
          "Hwang In-beom wins the triggered duel and releases Son Heung-min through Brazil's stretched middle."
        ]
      },
      transition: {
        style: "counter",
        flank: "left",
        tempo: 1.12,
        widthScale: 1.06,
        depthShift: 2,
        laneShift: -4,
        stagger: 1.3,
        intent: "Korea make the first regain a vertical action toward Son before Brazil's counterpress can surround the ball.",
        stepTitles: [
          "Hwang turns first-time",
          "Son attacks Danilo's wake",
          "Cho owns the rebound"
        ],
        stepCaptions: [
          "Hwang In-beom receives side-on and releases forward without taking the extra touch Brazil's swarm wants.",
          "Son Heung-min sprints into the space outside the right centre-back as Brazil's full-back recovers.",
          "Gue-Sung Cho follows through the centre for the square pass or second ball if Son is forced wide."
        ]
      }
    },

    "MAR|ESP": {
      recommendation: {
        player: "Hakim Ziyech",
        plan: "Release Hakim Ziyech early behind Spain's left-back, with Achraf Hakimi overlapping only after the first pass.",
        why: "Spain's long possession pushes its left side high, and the delayed overlap creates a two-versus-one before midfield recovers."
      },
      attack: {
        style: "direct",
        flank: "right",
        tempo: 1.04,
        widthScale: 1.03,
        depthShift: 0,
        laneShift: 3,
        stagger: 0.9,
        intent: "Morocco compress Spain centrally, then use Ziyech's early diagonal to attack the space beyond Spain's left-back.",
        stepTitles: [
          "Load Spain's left",
          "Ziyech clips the channel",
          "En-Nesyri crosses Laporte",
          "Ounahi owns Spain's clearance"
        ],
        stepCaptions: [
          "Azzedine Ounahi and Sofyan Amrabat draw Spain's midfield toward Morocco's right half-space.",
          "Hakim Ziyech receives on the move and plays behind the full-back before Spain can rebuild its rest defence.",
          "Youssef En-Nesyri runs across Aymeric Laporte while Achraf Hakimi supplies the outside option.",
          "En-Nesyri contests Ziyech's delivery and Azzedine Ounahi arrives first for Spain's dropping second ball."
        ]
      },
      press: {
        style: "low",
        flank: "right",
        tempo: 0.93,
        widthScale: 0.94,
        depthShift: -3,
        laneShift: 1,
        stagger: -1,
        intent: "Morocco concede harmless circulation, deny Busquets between lines, and trap Spain when possession reaches the sideline.",
        stepTitles: [
          "Seal Busquets' front",
          "Invite Laporte's carry",
          "Hakimi springs the boundary",
          "Saïss clears, Morocco resets"
        ],
        stepCaptions: [
          "En-Nesyri screens Sergio Busquets while Morocco's midfield protects passes into Pedri and Dani Olmo.",
          "Aymeric Laporte is allowed to advance until the ball enters the preselected wide pressing lane.",
          "Achraf Hakimi jumps from the compact line as Ziyech blocks the backward pass and Amrabat covers inside.",
          "Romain Saïss attacks Spain's forced cross, then Sofyan Amrabat leads Morocco's block out together."
        ]
      },
      transition: {
        style: "counter",
        flank: "right",
        tempo: 1.11,
        widthScale: 1.05,
        depthShift: 1,
        laneShift: 4,
        stagger: 1.4,
        intent: "Morocco turn a right-sided regain into three fast actions before Spain can counterpress through Busquets.",
        stepTitles: [
          "Amrabat wins the duel",
          "Ziyech turns downfield",
          "En-Nesyri splits Spain"
        ],
        stepCaptions: [
          "Sofyan Amrabat protects the tackle and feeds the first clean pass away from Spain's midfield pressure.",
          "Hakim Ziyech opens his body toward the touchline so his next action immediately advances play.",
          "Youssef En-Nesyri attacks between Spain's retreating centre-backs while Hakimi races outside for support."
        ]
      }
    },

    "ESP|MAR": {
      recommendation: {
        player: "Pedri",
        plan: "Rotate Pedri through Morocco's left half-space to draw Sofyan Amrabat out, then attack the cutback lane.",
        why: "Morocco dominate aerial service into a settled box, but a third-man run can dislocate the midfield screen without crossing early."
      },
      attack: {
        style: "central",
        flank: "left",
        tempo: 0.98,
        widthScale: 1.07,
        depthShift: 1,
        laneShift: -1,
        stagger: -0.5,
        intent: "Spain use Pedri's rotation and Olmo's width to pull Amrabat away from the cutback corridor.",
        stepTitles: [
          "Pedri drags Amrabat",
          "Olmo widens the lane",
          "Cutback beats Morocco",
          "Pedri splits Morocco's centre-backs"
        ],
        stepCaptions: [
          "Pedri drops beside Sergio Busquets, inviting Sofyan Amrabat to leave Morocco's compact midfield line.",
          "Dani Olmo holds the touchline until the full-back is fixed, then receives beyond the shifted block.",
          "The runner reaches the byline and cuts behind Morocco's defenders instead of challenging them in the air.",
          "Pedri disguises the final pass between Romain Saïss and Nayef Aguerd for Spain's first-time finish."
        ]
      },
      press: {
        style: "high",
        flank: "right",
        tempo: 1.06,
        widthScale: 0.98,
        depthShift: 3,
        laneShift: 3,
        stagger: 0.4,
        intent: "Spain deny Morocco's right-side outlet by screening Saïss and jumping Aguerd before Ziyech can face forward.",
        stepTitles: [
          "Screen Saïss from Bono",
          "Jump Aguerd's touch",
          "Lock Ziyech outside",
          "Olmo attacks Morocco's turnover"
        ],
        stepCaptions: [
          "Spain's centre-forward angles the press to remove Romain Saïss and encourage Bono toward Nayef Aguerd.",
          "The near winger accelerates during the pass while Pedri closes Morocco's supporting midfielder.",
          "Spain's full-back meets Hakim Ziyech tight to the line, with Rodri positioned under any clearance.",
          "Dani Olmo receives the high regain facing goal while Pedri races beyond Morocco's shrunken block."
        ]
      },
      transition: {
        style: "secure",
        flank: "right",
        tempo: 0.94,
        widthScale: 0.97,
        depthShift: -1,
        laneShift: 1,
        stagger: -1.2,
        intent: "Spain make the first post-regain pass safe and keep Rodri between En-Nesyri and the exposed centre-backs.",
        stepTitles: [
          "Rodri guards En-Nesyri",
          "Busquets takes the bounce",
          "Pedri resets possession"
        ],
        stepCaptions: [
          "Rodri delays his advance so Youssef En-Nesyri cannot become Morocco's immediate vertical target.",
          "Sergio Busquets offers behind the regain for a protected pass away from Ziyech and Boufal.",
          "Pedri moves into the next free lane and restarts the attack only after Spain recover their spacing."
        ]
      }
    },

    "POR|SUI": {
      recommendation: {
        player: "Gonçalo Ramos",
        plan: "Curve Gonçalo Ramos through the Akanji–Rodríguez seam as João Félix vacates Switzerland's last line.",
        why: "Switzerland's back line can step unevenly when Xhaka is screened and a forward leaves Akanji without central cover."
      },
      attack: {
        style: "direct",
        flank: "right",
        tempo: 1.07,
        widthScale: 1.02,
        depthShift: 2,
        laneShift: 2,
        stagger: 1,
        intent: "Portugal empty the right inside channel for Ramos to bend between Akanji and Rodríguez at speed.",
        stepTitles: [
          "Félix vacates Switzerland",
          "Ramos bends off Akanji",
          "Fernandes threads the seam",
          "Fernandes claims Switzerland's knockdown"
        ],
        stepCaptions: [
          "João Félix drops toward Granit Xhaka and pulls a defender away from Switzerland's last line.",
          "Gonçalo Ramos starts on Manuel Akanji's blind side before curving into the gap beside Ricardo Rodríguez.",
          "Bruno Fernandes delivers through the opening early enough for Ramos to finish before the block collapses.",
          "Gonçalo Ramos contests the direct ball and Bruno Fernandes reaches the edge first for Switzerland's loose clearance."
        ]
      },
      press: {
        style: "high",
        flank: "right",
        tempo: 1.08,
        widthScale: 0.99,
        depthShift: 3,
        laneShift: 2,
        stagger: 0.6,
        intent: "Portugal screen Xhaka and overload Akanji's first touch to stop Switzerland finding Embolo beyond midfield.",
        stepTitles: [
          "Ramos shadows Xhaka",
          "Bernardo jumps Akanji",
          "Neves locks Embolo",
          "Fernandes converts Akanji's turnover"
        ],
        stepCaptions: [
          "Gonçalo Ramos approaches the centre-back on an angle that keeps Granit Xhaka hidden behind him.",
          "Bernardo Silva leaves the winger only as the pass reaches Manuel Akanji, closing the forward lane first.",
          "Rúben Neves stays underneath the pressure and competes for any direct ball toward Breel Embolo.",
          "Bruno Fernandes collects Akanji's trapped turnover and releases Gonçalo Ramos before Switzerland can retreat."
        ]
      },
      transition: {
        style: "swarm",
        flank: "right",
        tempo: 1.1,
        widthScale: 1,
        depthShift: 1,
        laneShift: 2,
        stagger: 0.2,
        intent: "Portugal crowd Freuler at the moment of loss while Ramos remains beyond Rodríguez for the recovered pass.",
        stepTitles: [
          "Fernandes crowds Freuler",
          "Silva secures the second",
          "Ramos stays beyond Rodríguez"
        ],
        stepCaptions: [
          "Bruno Fernandes attacks Remo Freuler's first touch as the nearest two teammates erase short exits.",
          "Bernardo Silva positions for the ricochet rather than joining the first challenge from the same angle.",
          "Gonçalo Ramos holds the far shoulder of Ricardo Rodríguez and becomes the immediate depth option after recovery."
        ]
      }
    },

    "SUI|POR": {
      recommendation: {
        player: "Breel Embolo",
        plan: "Send Breel Embolo into the space behind João Cancelo, with Ruben Vargas arriving for the loose second ball.",
        why: "Portugal's right side advances early, and Pepe is least comfortable when dragged into a wide recovery race."
      },
      attack: {
        style: "direct",
        flank: "left",
        tempo: 1.05,
        widthScale: 1.04,
        depthShift: 1,
        laneShift: -3,
        stagger: 0.8,
        intent: "Switzerland invite Cancelo forward before playing Embolo outside Pepe and supporting the duel with Vargas.",
        stepTitles: [
          "Draw Cancelo forward",
          "Embolo runs outside Pepe",
          "Vargas attacks the spill",
          "Xhaka strikes Portugal's clearance"
        ],
        stepCaptions: [
          "Granit Xhaka circulates inward until João Cancelo steps high enough to leave Portugal's right channel open.",
          "Breel Embolo arcs away from Rúben Dias and attacks the outside shoulder of Pepe before the pass travels.",
          "Ruben Vargas follows inside Embolo to collect the knockdown or attack a low cross across the box.",
          "Breel Embolo challenges Pepe in the box and Granit Xhaka arrives onto Portugal's dropping second ball."
        ]
      },
      press: {
        style: "mid",
        flank: "right",
        tempo: 0.96,
        widthScale: 0.95,
        depthShift: -1,
        laneShift: 2,
        stagger: -0.7,
        intent: "Switzerland hold a narrow mid-block, hide Portugal's creators, and jump only when the ball reaches Cancelo.",
        stepTitles: [
          "Embolo screens Rúben Neves",
          "Xhaka springs on Bernardo",
          "Rodríguez closes Cancelo",
          "Embolo leads the Swiss break"
        ],
        stepCaptions: [
          "Breel Embolo protects the route into Rúben Neves while allowing Portugal's centre-backs harmless possession.",
          "Granit Xhaka accelerates when Bernardo Silva receives facing his own goal near the right half-space.",
          "Ricardo Rodríguez steps to João Cancelo as the winger recovers inside and removes the return pass.",
          "Granit Xhaka wins the midfield trigger and sends Breel Embolo through Portugal's open centre before it resets."
        ]
      },
      transition: {
        style: "counter",
        flank: "left",
        tempo: 1.09,
        widthScale: 1.06,
        depthShift: 2,
        laneShift: -4,
        stagger: 1.2,
        intent: "Switzerland bypass Portugal's central counterpress with one pass and race Embolo into the uncovered left lane.",
        stepTitles: [
          "Freuler releases first-time",
          "Embolo races Portugal",
          "Shaqiri fills the cutback"
        ],
        stepCaptions: [
          "Remo Freuler plays around the first presser immediately instead of carrying into Bruno Fernandes and Bernardo Silva.",
          "Breel Embolo accelerates through Portugal's vacant right-back space while Xhaka holds the central safety valve.",
          "Xherdan Shaqiri arrives behind the sprint for a cutback once Embolo has forced the centre-backs toward goal."
        ]
      }
    },

    "NED|ARG": {
      recommendation: {
        player: "Denzel Dumfries",
        plan: "Hide Denzel Dumfries on the weak side, then find his back-post run once Depay pins Argentina's left centre-back.",
        why: "Argentina's left side narrows toward Messi during long defensive phases and can lose the far wing-back after a switch."
      },
      attack: {
        style: "wingback",
        flank: "right",
        tempo: 1.02,
        widthScale: 1.08,
        depthShift: 1,
        laneShift: 3,
        stagger: 0.7,
        intent: "The Netherlands circulate left to compress Argentina before switching early to Dumfries at the far post.",
        stepTitles: [
          "Blind fixes Argentina",
          "Depay pins Otamendi",
          "Dumfries owns the far post",
          "Dumfries crosses beyond Otamendi"
        ],
        stepCaptions: [
          "Daley Blind and Cody Gakpo hold Argentina on the left while Frenkie de Jong prepares the diagonal switch.",
          "Memphis Depay occupies Nicolás Otamendi so the centre-back cannot leave the middle to defend width.",
          "Denzel Dumfries arrives beyond Argentina's full-back for a first-time cross or back-post finish.",
          "Dumfries delivers across Otamendi for Depay and the far wing-back arriving beyond Argentina's last defender."
        ]
      },
      press: {
        style: "mid",
        flank: "left",
        tempo: 0.97,
        widthScale: 0.96,
        depthShift: -1,
        laneShift: -2,
        stagger: -0.5,
        intent: "The Netherlands steer Argentina toward Romero, then close Enzo while preserving Van Dijk behind Messi.",
        stepTitles: [
          "Gakpo curves onto Romero",
          "De Jong closes Enzo",
          "Van Dijk protects Messi",
          "Depay springs from the regain"
        ],
        stepCaptions: [
          "Cody Gakpo bends his run from outside to block Cristian Romero's direct pass into Argentina's right side.",
          "Frenkie de Jong advances only as Enzo Fernández becomes available, keeping the midfield line connected.",
          "Virgil van Dijk holds depth rather than following Lionel Messi, preserving cover against Julián Álvarez.",
          "Frenkie de Jong wins the halfway trap and immediately releases Memphis Depay through Argentina's stretched centre."
        ]
      },
      transition: {
        style: "counter",
        flank: "right",
        tempo: 1.08,
        widthScale: 1.07,
        depthShift: 1,
        laneShift: 4,
        stagger: 1.1,
        intent: "The Netherlands use De Jong's press escape to draw Argentina centrally and release Dumfries into open width.",
        stepTitles: [
          "De Jong escapes pressure",
          "Depay draws Tagliafico",
          "Dumfries storms weak side"
        ],
        stepCaptions: [
          "Frenkie de Jong carries through the first challenge instead of forcing a vertical ball into Argentina's compact centre.",
          "Memphis Depay checks toward the ball and pulls Nicolás Tagliafico away from the outside lane.",
          "Denzel Dumfries accelerates past the recovering midfield and receives before Argentina's block can slide."
        ]
      }
    },

    "ARG|NED": {
      recommendation: {
        player: "Lionel Messi",
        plan: "Create Lionel Messi's receive behind Frenkie de Jong, then send Nahuel Molina outside Daley Blind.",
        why: "The Dutch midfield can be pinned by Álvarez, opening the pocket ahead of the left centre-back and inside the wing-back."
      },
      attack: {
        style: "central",
        flank: "right",
        tempo: 1.01,
        widthScale: 1.02,
        depthShift: 1,
        laneShift: 2,
        stagger: 0.4,
        intent: "Argentina pin the Dutch back three with Álvarez so Messi can receive behind De Jong and release Molina.",
        stepTitles: [
          "Álvarez fixes Van Dijk",
          "Messi receives beyond Frenkie",
          "Molina overlaps Blind",
          "Messi releases Álvarez centrally"
        ],
        stepCaptions: [
          "Julián Álvarez stays between Virgil van Dijk and Nathan Aké to prevent either defender stepping freely.",
          "Lionel Messi drifts from the front line into the pocket behind Frenkie de Jong as Rodrigo De Paul finds him.",
          "Nahuel Molina sprints outside Daley Blind once Messi turns, creating the pass that breaks the final line.",
          "Messi disguises the through-ball between Van Dijk and Aké so Julián Álvarez can finish first-time."
        ]
      },
      press: {
        style: "mid",
        flank: "right",
        tempo: 0.99,
        widthScale: 0.95,
        depthShift: 0,
        laneShift: 3,
        stagger: -0.3,
        intent: "Argentina bend the press toward the Dutch left and trap Blind without letting Depay receive between midfield and defence.",
        stepTitles: [
          "Álvarez bends toward Aké",
          "De Paul traps Blind",
          "Enzo blocks Depay",
          "Messi receives the Dutch turnover"
        ],
        stepCaptions: [
          "Julián Álvarez closes Nathan Aké on an angle that encourages the predictable pass toward Daley Blind.",
          "Rodrigo De Paul jumps Blind as Nahuel Molina closes the line and Messi removes the inside return.",
          "Enzo Fernández remains goal-side of Memphis Depay to collect any forced pass or loose clearance.",
          "Rodrigo De Paul wins the wide trap and finds Lionel Messi before the Dutch midfield can close around him."
        ]
      },
      transition: {
        style: "counter",
        flank: "right",
        tempo: 1.07,
        widthScale: 1.04,
        depthShift: 1,
        laneShift: 3,
        stagger: 0.9,
        intent: "Argentina secure the first contact, turn Messi through midfield, and let Molina outrun the Dutch wing-back.",
        stepTitles: [
          "Mac Allister secures contact",
          "Messi turns Dutch midfield",
          "Molina carries the overlap"
        ],
        stepCaptions: [
          "Alexis Mac Allister protects the regain from immediate pressure and gives Lionel Messi a clean supporting angle.",
          "Messi receives facing forward before Frenkie de Jong can recover to the central screen.",
          "Nahuel Molina attacks outside the ball, forcing Daley Blind backward and opening the inside finishing lane."
        ]
      }
    },

    "CRO|BRA": {
      recommendation: {
        player: "Luka Modrić",
        plan: "Use Luka Modrić to invite Brazil's right-side press, escape it, then switch Ivan Perišić at Éder Militão.",
        why: "Brazil's midfield jumps aggressively, exposing the far-side defender once Croatia break the first pressure line."
      },
      attack: {
        style: "buildup",
        flank: "left",
        tempo: 0.96,
        widthScale: 1.05,
        depthShift: 0,
        laneShift: -2,
        stagger: -0.8,
        intent: "Croatia lure Brazil toward Modrić and Kovačić before changing the point of attack to Perišić against Militão.",
        stepTitles: [
          "Modrić invites Brazil",
          "Kovačić breaks Paquetá",
          "Perišić receives the switch",
          "Modrić springs Perišić beyond Brazil"
        ],
        stepCaptions: [
          "Luka Modrić drops beside the centre-backs and holds the ball long enough for Brazil's midfield to jump.",
          "Mateo Kovačić carries through Lucas Paquetá's pressure while Marcelo Brozović protects the return lane.",
          "Ivan Perišić stays detached on the left and receives the switch before Éder Militão can close the gap.",
          "Modrić plays the first-time diagonal behind Brazil's far full-back and Perišić attacks the exposed box."
        ]
      },
      press: {
        style: "mid",
        flank: "right",
        tempo: 0.95,
        widthScale: 0.94,
        depthShift: -1,
        laneShift: 1,
        stagger: -0.9,
        intent: "Croatia screen Neymar with Brozović and press Paquetá only when Brazil enter the chosen right-sided lane.",
        stepTitles: [
          "Kramarić screens Casemiro",
          "Modrić jumps Paquetá",
          "Brozović denies Neymar",
          "Perišić carries Croatia's counter"
        ],
        stepCaptions: [
          "Andrej Kramarić stays connected to Casemiro and guides Brazil's centre-backs away from their preferred pivot.",
          "Luka Modrić steps onto Lucas Paquetá as the pass travels, with Josip Juranović protecting the flank.",
          "Marcelo Brozović holds Neymar's central pocket instead of being drawn toward the first pressing duel.",
          "Modrić claims Paquetá's forced pass and releases Ivan Perišić through the centre of Brazil's open shape."
        ]
      },
      transition: {
        style: "secure",
        flank: "left",
        tempo: 0.92,
        widthScale: 1.01,
        depthShift: -1,
        laneShift: -3,
        stagger: -1.3,
        intent: "Croatia survive Brazil's counterpress through Kovačić, then let Modrić switch into Perišić's isolated lane.",
        stepTitles: [
          "Kovačić survives the swarm",
          "Modrić changes the horizon",
          "Perišić attacks Militão"
        ],
        stepCaptions: [
          "Mateo Kovačić shields the regain and carries laterally away from Casemiro and Lucas Paquetá.",
          "Luka Modrić offers behind the ball and opens his body to transfer play before Brazil's block can reset.",
          "Ivan Perišić receives against Éder Militão with Borna Sosa arriving outside only after control is established."
        ]
      }
    },

    "BRA|CRO": {
      recommendation: {
        player: "Neymar Junior",
        plan: "Move Neymar Junior off Brozović's shoulder, then combine with Vinícius Jr before Croatia can reset.",
        why: "Croatia protect direct central entries but can be split by a third-man pass after their midfield triangle shifts left."
      },
      attack: {
        style: "central",
        flank: "left",
        tempo: 1.05,
        widthScale: 1.04,
        depthShift: 1,
        laneShift: -1,
        stagger: 0.6,
        intent: "Brazil use Vinícius to stretch Juranović while Neymar circles behind Brozović for a rapid third-man combination.",
        stepTitles: [
          "Vinícius pins Juranović",
          "Neymar leaves Brozović",
          "Paquetá returns the third",
          "Neymar releases Richarlison"
        ],
        stepCaptions: [
          "Vinícius Jr holds the left touchline and prevents Josip Juranović from narrowing onto Neymar.",
          "Neymar Junior drops off Marcelo Brozović's shoulder as Richarlison fixes Croatia's two centre-backs.",
          "Lucas Paquetá receives Neymar's bounce and returns through the new gap before Luka Modrić can recover.",
          "Neymar Junior slips the final pass between Gvardiol and Lovren for Richarlison's first-time finish."
        ]
      },
      press: {
        style: "high",
        flank: "right",
        tempo: 1.09,
        widthScale: 0.98,
        depthShift: 3,
        laneShift: 2,
        stagger: 0.7,
        intent: "Brazil curve the front press toward Gvardiol and close Kovačić without freeing Modrić behind the first wave.",
        stepTitles: [
          "Richarlison curves at Gvardiol",
          "Raphinha closes Kovačić",
          "Casemiro shadows Modrić",
          "Neymar attacks Gvardiol's error"
        ],
        stepCaptions: [
          "Richarlison approaches Joško Gvardiol from the middle so Croatia cannot switch cleanly through Dejan Lovren.",
          "Raphinha narrows onto Mateo Kovačić as the ball travels, leaving the full-back to control Croatia's outside outlet.",
          "Casemiro stays attached to Luka Modrić's forward lane and prevents the press from being beaten by one pass.",
          "Neymar Junior receives the high regain from Gvardiol and attacks Croatia's narrowed box before it can reset."
        ]
      },
      transition: {
        style: "swarm",
        flank: "left",
        tempo: 1.11,
        widthScale: 1.01,
        depthShift: 1,
        laneShift: -2,
        stagger: 0.1,
        intent: "Brazil surround Modrić immediately after losing the ball and release Neymar toward Vinícius when it breaks free.",
        stepTitles: [
          "Paquetá crowds Modrić",
          "Neymar claims the release",
          "Vinícius outruns Croatia"
        ],
        stepCaptions: [
          "Lucas Paquetá attacks Luka Modrić's first touch while Casemiro and the nearest winger remove short support.",
          "Neymar Junior positions outside the pressure ring to receive the recovered ball facing Croatia's back line.",
          "Vinícius Jr starts beyond Josip Juranović and accelerates before Croatia's midfield can recover into shape."
        ]
      }
    }
  };
});
