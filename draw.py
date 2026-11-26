#!/usr/bin/env python3
"""Draw entry.png for news-image-20261126: a one-day newspaper front page.

32 stories, 8 regions, all first reported / happened on Thursday 26 November 2026.
Rendered with Pillow + DejaVu fonts at 1024x1024. Run: python3 draw.py
Writes entry.png next to this script. Details are trimmed to fit two lines.
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W = H = 1024
PAPER = (250, 246, 236)
INK = (17, 17, 17)
MUTED = (90, 84, 70)
RED = (178, 34, 34)
NAVY = (18, 38, 66)

SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# (region, accent colour, [(headline, detail), ...]) — 8 regions x 4 stories = 32
REGIONS = [
    ("NORTH AMERICA", (18, 38, 66), [
        ("TRUMP UNVEILS NEW TARIFFS ON 14 PARTNERS",
         "China 20%, EU/Japan/Korea 15%, India 25%, Vietnam 35%."),
        ("SECOND JUDGE BLOCKS BIRTHRIGHT ORDER",
         "A second federal judge halts Trump's newest birthright order."),
        ("SIX MISSING AFTER PLANE CRASHES IN GULF",
         "Coast Guard hunts for six aboard a small plane down in the Gulf."),
        ("FED: MODEST GROWTH, PRICES STILL PRESSURED",
         "Beige Book: modest growth and wage gains, price pressure persists."),
    ]),
    ("EUROPE", (0, 90, 110), [
        ("EU SUMMIT OPENS ON BUDGET AND UKRAINE",
         "Leaders meet in Brussels on the 2028-34 budget and \u20ac45bn for Ukraine."),
        ("UK OPENS DOOR TO 100,000 YOUNG EUROPEANS",
         "Burnham's Brexit reset lets EU under-32s live, work and study in UK."),
        ("FRANCE PASSES YEAR-END BUDGET 135-64",
         "National Assembly approves the 2026 year-end budget; 89 MPs abstain."),
        ("BELLINGHAM WONDERGOAL SINKS PSV",
         "Real Madrid thump PSV; Arsenal 1-1 Dortmund; Barca 4-1 Sabah."),
    ]),
    ("MIDDLE EAST", (140, 60, 20), [
        ("HOUTHIS CLAIM STRIKE ON SAUDI REFINERY",
         "Ras Tanura, Saudi Arabia's largest refinery, hit; Brent tops $94."),
        ("TWO TANKERS EXPLODE IN STRAIT OF HORMUZ",
         "Ships hit naval mines; engine-room fires on routes Tehran calls off-limits."),
        ("ISRAEL KILLS HAMAS COLONEL IN GAZA",
         "Mohammad Abuelouf, wife and two children killed; ceasefire strained."),
        ("ROAD CRASH IN UAE KILLS 11",
         "Eleven people die in a road accident in Ras Al Khaimah emirate."),
    ]),
    ("SOUTH ASIA", (120, 30, 90), [
        ("INDIA MARKS 18 YEARS SINCE 26/11",
         "Mumbai remembers 174 dead in the 2008 attacks; Constitution Day too."),
        ("INDIA PLEDGES \u20b915,000 CRORE TO NEPAL",
         "Package announced after Modi meets Nepal PM Balendra Shah in Delhi."),
        ("BANGLADESH GARMENT PAY UP 36%",
         "Minimum wage for entry-level garment workers rises by a third."),
        ("HASINA PLANS RETURN ON 16 DECEMBER",
         "Ousted Bangladesh PM Sheikh Hasina seeks to return home on 16 Dec."),
    ]),
    ("EAST ASIA & PACIFIC", (0, 110, 70), [
        ("TAIWAN SHARES PLUNGE 1,926.92 POINTS",
         "Index closes at 38,195.43; NT dollar weakens past 33 per US dollar."),
        ("AUSTRALIA-SOLOMONS SIGN SECURITY PACT",
         "Canberra becomes defence partner of choice; 2022 China pact scrapped."),
        ("NORTH KOREA EXPELS SWISS DIPLOMAT",
         "Pyongyang shuts Switzerland's office; envoy must leave in 48 hours."),
        ("5.6 QUAKE SHAKES NEPAL'S KOSHI",
         "Magnitude 5.6 earthquake strikes Koshi Province near the border."),
    ]),
    ("AFRICA", (150, 100, 0), [
        ("CULT LEADER CONVICTED OF NEW CHARGES",
         "Mackenzie, serving 200 years for 191 deaths, guilty of 5 cruelty counts."),
        ("SUDAN DRONE STRIKES KILL AT LEAST 19",
         "RSF drones hit Blue Nile state; about 25 wounded in the drone war."),
        ("RAMAPHOSA WINS PHALA PHALA COURT FIGHT",
         "High Court sets aside report over the $580,000 Phala Phala theft."),
        ("FIRST GENERIC HIV DRUG LANDS IN ZAMBIA",
         "Twice-yearly lenacapavir arrives; Uganda next, Zimbabwe early 2027."),
    ]),
    ("LATIN AMERICA", (170, 40, 60), [
        ("POLICE FREE 20 AFTER 17-HOUR SIEGE",
         "Police storm Cartagena supermarket after a failed cash-truck robbery."),
        ("ECUADOR RAINS KILL 27",
         "Floods leave 27 dead; minister says US talks review joint operations."),
        ("ARGENTINE PESO HITS 1,592 PER DOLLAR",
         "Country risk passes 1,100 points as Milei's austerity squeeze deepens."),
        ("BOLSONARO FLEES BRAZIL AFTER DEFEAT",
         "Flavio Bolsonaro leaves for the US after losing Sunday's election."),
    ]),
    ("SCIENCE, TECH & SPORT", (60, 60, 140), [
        ("CHESS CROWN: SECOND DRAW IN GENEVA",
         "Gukesh-Sindarov draw Game 2 by repetition; match 1-1; $2.5m purse."),
        ("15-YEAR-OLD SMASHES 204 OFF 53 BALLS",
         "Sooryavanshi, 15, hits fastest List A double century vs UAE."),
        ("1,220 PLAYERS ENTER IPL 2027 AUCTION",
         "Ben Stokes returns to the pool ahead of the 2027 season."),
        ("US TIGHTENS REMOTE AI-CHIP RULES",
         "Thousands of Nvidia B300 GPUs seek buyers; Booker presses Nvidia."),
    ]),
]


def wrap(draw, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def main():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    f_top = ImageFont.truetype(SANS_B, 15)
    f_date = ImageFont.truetype(SERIF_B, 66)
    f_sub = ImageFont.truetype(SANS_B, 16)
    f_tick = ImageFont.truetype(SANS_B, 14)
    f_region = ImageFont.truetype(SANS_B, 13)
    f_head = ImageFont.truetype(SANS_B, 13)
    f_det = ImageFont.truetype(SANS, 11)
    f_foot = ImageFont.truetype(SANS, 11)

    # --- top black bar ---
    d.rectangle([0, 0, W, 34], fill=INK)
    d.text((26, 9), "THE WORLD IN ONE DAY", font=f_top, fill=(255, 255, 255))
    right = "ONE DAY  •  ONE PICTURE"
    d.text((W - 26 - d.textlength(right, font=f_top), 9), right, font=f_top, fill=(255, 255, 255))

    # --- masthead: the date, huge ---
    date = "26 NOVEMBER 2026"
    d.text(((W - d.textlength(date, font=f_date)) / 2, 44), date, font=f_date, fill=INK)
    sub = "THURSDAY  —  THE WORLD'S NEWS, FIRST REPORTED TODAY"
    d.text(((W - d.textlength(sub, font=f_sub)) / 2, 122), sub, font=f_sub, fill=RED)
    d.line([(26, 148), (W - 26, 148)], fill=INK, width=2)

    # --- ticker strip ---
    tick = "BRENT CRUDE TOPS $94   •   TAIWAN SHARES -1,926.92   •   PESO 1,592/$   •   32 STORIES  •  8 REGIONS"
    d.rectangle([26, 158, W - 26, 186], fill=NAVY)
    d.text(((W - d.textlength(tick, font=f_tick)) / 2, 165), tick, font=f_tick, fill=(255, 255, 255))

    # --- grid: 4 columns, each 2 region blocks of 4 stories ---
    margin, gutter = 26, 12
    col_w = (W - 2 * margin - 3 * gutter) // 4
    grid_top, grid_h = 198, 776
    block_h = (grid_h - gutter) // 2
    story_h = (block_h - 24) // 4  # 24 = region header band
    for ci in range(4):
        x0 = margin + ci * (col_w + gutter)
        for bi in range(2):
            region, colour, stories = REGIONS[ci * 2 + bi]
            y0 = grid_top + bi * (block_h + gutter)
            # region header band
            d.rectangle([x0, y0, x0 + col_w, y0 + 24], fill=colour)
            d.text((x0 + 8, y0 + 5), region, font=f_region, fill=(255, 255, 255))
            # stories
            for si, (head, det) in enumerate(stories):
                sy = y0 + 24 + si * story_h
                tx = x0 + 4
                max_w = col_w - 8
                hl = wrap(d, head, f_head, max_w)
                y = sy + 6
                for line in hl[:2]:
                    d.text((tx, y), line, font=f_head, fill=INK)
                    y += 16
                dl = wrap(d, det, f_det, max_w)
                for line in dl[:3]:
                    d.text((tx, y), line, font=f_det, fill=(60, 56, 48))
                    y += 14
                if si < 3:
                    d.line([(x0 + 4, sy + story_h - 5), (x0 + col_w - 4, sy + story_h - 5)],
                           fill=(200, 192, 175), width=1)
            # vertical divider between columns
            if ci < 3:
                d.line([(x0 + col_w + gutter // 2, grid_top),
                        (x0 + col_w + gutter // 2, grid_top + grid_h)],
                       fill=(205, 198, 182), width=1)

    # --- footer ---
    d.line([(26, 986), (W - 26, 986)], fill=INK, width=2)
    foot = "All 32 stories happened or were first reported on Thursday 26 November 2026."
    d.text(((W - d.textlength(foot, font=f_foot)) / 2, 992), foot, font=f_foot, fill=MUTED)
    d.rectangle([0, 0, W - 1, H - 1], outline=INK, width=2)

    out = os.path.join(HERE, "entry.png")
    img.save(out, "PNG", optimize=True)
    print("wrote", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    main()
