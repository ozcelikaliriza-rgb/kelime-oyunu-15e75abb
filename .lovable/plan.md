

# Turkish Wordle - Progressive Word Game

## Overview
A progressive Turkish Wordle game where players guess words from 3 to 8 letters, with a minimalist white design and custom Turkish keyboard. Uses the uploaded `words.json` file containing real Turkish words.

## Data Setup
- Copy the uploaded `words.json` to `public/words.json` so it can be fetched at runtime
- The file contains word lists keyed by length ("3", "4", ... "8")

## Game Page (Single Page)
- **Header**: Game title "Türkçe Wordle", current level indicator (e.g., "Level 3 - 5 Harf"), progress dots showing levels 3→8
- **Word Grid**: Rows of 60×60px tiles (responsive), white background with 2px #D1D5DB border, 6 guess attempts per level
- **Color Feedback**: Green (#22C55E) correct position, Yellow (#EAB308) wrong position, Dark Gray (#374151) not in word
- **Turkish Keyboard**: 3-row layout with Ç, Ğ, İ, Ö, Ş, Ü, plus Enter and Backspace keys. Keys reflect feedback colors as guesses are made
- **Level Complete Modal**: Simple overlay with "Tebrikler!" message and "Sonraki Seviye" button
- **Game Over Screen**: Summary showing attempts per level, total attempts, and "Tekrar Oyna" button

## Design
- Pure white (#FFFFFF) background everywhere, no dark mode
- Inter / system sans-serif, bold black text
- Clean minimal aesthetic, no unnecessary decoration
- Fully responsive for mobile and desktop

## Game Logic
- Fetch `words.json` on load, pick random target word for current level
- Validate guesses against the word list (only accept valid words)
- Track letter states across guesses for keyboard coloring
- Progress 3→4→5→6→7→8 on success
- Track total attempts across all levels for final summary

