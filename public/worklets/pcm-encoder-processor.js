// Runs on the audio rendering thread. Converts whatever channel layout the
// mic/source provides into interleaved 16-bit PCM stereo frames (mono inputs
// are duplicated to both channels) and posts them to the main thread as
// transferable ArrayBuffers, ready to send straight over the broadcast
// WebSocket with no further processing.
class PCMEncoderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0 || !input[0] || input[0].length === 0) {
      return true;
    }

    const frameCount = input[0].length;
    const left = input[0];
    const right = input.length > 1 ? input[1] : input[0];

    const interleaved = new Int16Array(frameCount * 2);
    for (let i = 0; i < frameCount; i++) {
      const l = Math.max(-1, Math.min(1, left[i]));
      const r = Math.max(-1, Math.min(1, right[i]));
      interleaved[i * 2] = l < 0 ? l * 0x8000 : l * 0x7fff;
      interleaved[i * 2 + 1] = r < 0 ? r * 0x8000 : r * 0x7fff;
    }

    this.port.postMessage(interleaved.buffer, [interleaved.buffer]);
    return true;
  }
}

registerProcessor("pcm-encoder-processor", PCMEncoderProcessor);
