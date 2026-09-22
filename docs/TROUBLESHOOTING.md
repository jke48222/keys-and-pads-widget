# keys-and-pads: troubleshooting

Run `./check.sh` first; it prints a pass/fail line per item.

- **Clicks do nothing.** Interaction mode is off. Set an interaction shortcut in Übersicht → Preferences → General, press it, and the widget takes input.
- **No sound.** The first click starts the audio engine (browsers require a gesture). If the pad lights up but stays silent, check the system output device; the widget follows it.
- **Typing plays the wrong instrument.** Look at the Pads / Keys switch in the top right; Tab flips it.
- **Sequencer drifts or stutters.** It schedules on the audio clock with a 120 ms lookahead; heavy CPU load elsewhere can still starve it. Close what is hogging the machine.
