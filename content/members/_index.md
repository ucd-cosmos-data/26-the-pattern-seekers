---
title: "Members"
---
<style>
/* Base styling for the box around each member */
.member-block {
  position: relative; /* Required so the animated border lines position correctly */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth animation trigger */
}

/* The elevation effect when the mouse hovers over the box */
.member-block:hover {
  transform: translateY(-5px); /* Lifts the box up slightly */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12); /* Deepens the shadow to look elevated */
}

/* Common setup for the tracing border outlines */
.member-block::before,
.member-block::after {
  content: '';
  position: absolute;
  background: transparent; /* Fixed: Keeps it from overlaying a black block */
  transition: width 0.3s ease, height 0.3s ease;
  z-index: 2; /* Keeps the borders crisp on top */
  pointer-events: none; /* Makes sure the outline doesn't block text selection */
}

/* Left side line trace: Starts at top-center, goes left, down, then to bottom-center */
.member-block::before {
  top: -1px; /* Aligns perfectly on top of the original gray border */
  right: 50%;
  width: 0;
  height: 0;
  border-top: 2px solid transparent;
  border-left: 2px solid transparent;
  border-bottom: 2px solid transparent;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

/* Right side line trace: Starts at top-center, goes right, down, then to bottom-center */
.member-block::after {
  top: -1px; /* Aligns perfectly on top of the original gray border */
  left: 50%;
  width: 0;
  height: 0;
  border-top: 2px solid transparent;
  border-right: 2px solid transparent;
  border-bottom: 2px solid transparent;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* Trigger the outline drawing animation on hover */
.member-block:hover::before {
  width: 50%;
  height: calc(100% + 2px); /* Seamlessly fits the height of the block */
  border-color: #000000; /* Turns the specific borders black on hover */
}

.member-block:hover::after {
  width: 50%;
  height: calc(100% + 2px); /* Seamlessly fits the height of the block */
  border-color: #000000; /* Turns the specific borders black on hover */
}

@media (max-width: 600px) {
  .member-block {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center;
  }
  .member-block img {
    margin-bottom: 10px;
  }
}
</style>

### Advay Mandalia

<div class="member-block" style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 40px;">

  <img src="/26-the-pattern-seekers/members/advay.jpeg"
       alt="Advay Mandalia"
       style="width: 150px; height: 150px; object-fit: contain; border-radius: 0%; object-position: center; flex-shrink: 0;">

  <div style="flex: 1; text-align: left;">
    <p style="margin: 0; padding-top: 0.5em;">
      Advay is a rising junior at Amador Valley High School in Pleasanton, and is also a national level cricketer
    </p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>He follows most sports from NFL to IPL</li>
      <li>Likes hooping with friends and playing video games</li>
      <li>Wants to enjoy, but also learn at UC Davis</li>
    </ul>
  </div>

</div>

### Jerry Li

<div class="member-block" style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 40px;">

  <img src="/26-the-pattern-seekers/members/lemon.jpeg"
       alt="Lemon"
       style="width: 150px; height: 150px; object-fit: contain; border-radius: 25%; object-position: center; flex-shrink: 0;">

  <div style="flex: 1; text-align: left;">
    <p style="margin: 0; padding-top: 0.5em;">
      Jerry is a rising junior at Cupertino High School in Cupertino
    </p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>He does not like dinosaurs.</li>
      <li>He likes BBQ.</li>
      <li>He likes cookies.</li>
    </ul>
  </div>

</div>

### Pranav Elaprolu

<div class="member-block" style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 40px;">

  <img src="/26-the-pattern-seekers/members/luffy.jpg"
       alt="Luffy"
       style="width: 150px; height: 150px; object-fit: contain; border-radius: 25%; object-position: center; flex-shrink: 0;">

  <div style="flex: 1; text-align: left;">
    <p style="margin: 0; padding-top: 0.5em;">
      Pranav is a rising senior at Irvington High School
    </p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Pranav does not know how to code.</li>
      <li>He also does not like ice cream.</li>
      <li>He likes falling asleep.</li>
    </ul>
  </div>

</div>

### Brendan Park

<div class="member-block" style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 40px;">

  <img src="/26-the-pattern-seekers/members/brendan.jpeg"
       alt="Brendan Park"
       style="width: 150px; height: 150px; object-fit: contain; border-radius: 25%; object-position: center; flex-shrink: 0;">

  <div style="flex: 1; text-align: left;">
    <p style="margin: 0; padding-top: 0.5em;">
      Brendan is a rising junior at Oxford Academy in Cypress.
    </p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>He likes to play basketball with friends</li>
      <li>He likes to buy clothes</li>
      <li>His favorite food is pasta</li>
    </ul>
  </div>

</div>