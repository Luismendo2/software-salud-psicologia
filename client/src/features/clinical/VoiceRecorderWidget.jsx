import { useEffect, useRef, useState } from 'react';
import { transcribeAudio } from '../../services/aiClinicalService';

export default function VoiceRecorderWidget({ disabled, onTranscript }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopTracks(), []);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Tu navegador no permite grabar audio. Puedes escribir la nota manualmente.');
      return;
    }
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stopTracks();
        setStatus('transcribing');
        try {
          const audio = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const transcript = await transcribeAudio(audio);
          onTranscript(transcript);
          setStatus('complete');
        } catch (requestError) {
          setError(requestError.message || 'No fue posible transcribir el audio.');
          setStatus('idle');
        }
      };
      recorder.start();
      setStatus('recording');
    } catch {
      setError('No se concedió acceso al micrófono. Puedes continuar escribiendo manualmente.');
      setStatus('idle');
    }
  };

  const stopRecording = () => recorderRef.current?.state === 'recording' && recorderRef.current.stop();
  const isBusy = disabled || status === 'transcribing';

  return (
    <div className={`ai-recorder ${status === 'recording' ? 'is-recording' : ''}`}>
      <div className="ai-recorder-main">
        <div className="ai-recorder-icon" aria-hidden="true">◌</div>
        <div>
          <strong>{status === 'recording' ? 'Escuchando la nota' : status === 'transcribing' ? 'Transcribiendo audio' : 'Dictado clínico'}</strong>
          <p>{status === 'recording' ? 'Habla con normalidad. El audio no se guarda en PsiAgenda.' : 'Graba una idea y revisa el texto antes de guardarlo.'}</p>
        </div>
      </div>
      {status === 'recording' && <div className="ai-audio-pulse" aria-label="Grabación en curso"><i /><i /><i /><i /><i /></div>}
      <button type="button" className={`btn btn-sm ${status === 'recording' ? 'btn-danger' : 'btn-outline-primary'}`} onClick={status === 'recording' ? stopRecording : startRecording} disabled={isBusy}>
        {status === 'recording' ? 'Detener grabación' : status === 'transcribing' ? 'Transcribiendo…' : 'Iniciar grabación'}
      </button>
      {status === 'complete' && <span className="ai-status-success">Texto añadido a la nota</span>}
      {error && <p className="ai-inline-error" role="alert">{error}</p>}
    </div>
  );
}
