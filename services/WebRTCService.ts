import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  mediaDevices,
} from 'react-native-webrtc';
import {
  firebaseFirestore,
  firestoreDoc,
  firestoreCollection,
  firestoreSetDoc,
  firestoreUpdateDoc,
  firestoreDeleteDoc,
  firestoreAddDoc,
  firestoreOnSnapshot,
} from '../config/firebase';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private roomName: string = '';
  private isHost: boolean = false;
  private remoteCandidates: RTCIceCandidate[] = [];

  // Callbacks
  public onLocalStream?: (stream: MediaStream) => void;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: string) => void;
  public onIceConnectionStateChange?: (state: string) => void;

  private peerConstraints = {
    iceServers: [
      // Reliable Google STUN servers (keep these)
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },

      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },

      { urls: 'stun:stunserver2025.stunprotocol.org:3478' },
      { urls: 'turn:relay.metered.ca:80' },               
      { urls: 'turn:relay.metered.ca:443?transport=tcp' },

      { urls: 'turn:stun.evan-brass.net:3478' },
      { urls: 'turn:stun.evan-brass.net:3478?transport=tcp' },
    ],
    iceCandidatePoolSize: 10,
  };

  private sessionConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
    voiceActivityDetection: true,
  };

  async startCall(roomName: string, isHost: boolean, isVoiceOnly: boolean = false) {
    this.roomName = roomName;
    this.isHost = isHost;

    console.log('========================================');
    console.log('🚀 Starting call...');
    console.log(`Room: ${roomName}`);
    console.log(`Role: ${isHost ? 'HOST' : 'GUEST'}`);
    console.log(`Mode: ${isVoiceOnly ? 'VOICE ONLY' : 'VIDEO'}`);
    console.log('========================================');

    try {
      // Step 1: Get user media
      console.log('Step 1: Getting user media...');
      await this.getUserMedia(isVoiceOnly);
      console.log('✅ User media obtained');

      // Step 2: Create peer connection
      console.log('Step 2: Creating peer connection...');
      this.createPeerConnection();
      console.log('✅ Peer connection created');

      // Step 3: Add local stream to peer connection
      if (this.localStream) {
        console.log('Step 3: Adding local tracks to peer connection...');
        this.localStream.getTracks().forEach(track => {
          console.log(`Adding ${track.kind} track:`, track.id);
          this.peerConnection?.addTrack(track, this.localStream!);
        });
        console.log('✅ Local tracks added');
      }

      // Step 4: Setup Firestore listeners for signaling
      console.log('Step 4: Setting up Firestore listeners...');
      this.setupFirestoreListeners();
      console.log('✅ Firestore listeners set up');

      // Step 5: If host, create offer
      if (isHost) {
        console.log('Step 5: Creating offer (HOST)...');
        await this.createOffer();
        console.log('✅ Offer created');
      } else {
        console.log('Step 5: Waiting for offer (GUEST)...');
      }

      console.log('========================================');
      console.log('✅ Call initialization complete');
      console.log('========================================');

      return true;
    } catch (error) {
      console.error('❌ Error starting call:', error);
      throw error;
    }
  }

  private async getUserMedia(isVoiceOnly: boolean) {
    const mediaConstraints = {
      audio: true,
      video: isVoiceOnly ? false : {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: 'user',
      },
    };

    try {
      console.log('📹 Requesting media with constraints:', JSON.stringify(mediaConstraints, null, 2));
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);

      console.log('✅ Media stream obtained');
      console.log('Audio tracks:', mediaStream.getAudioTracks().length);
      console.log('Video tracks:', mediaStream.getVideoTracks().length);

      mediaStream.getTracks().forEach(track => {
        console.log(`Track: ${track.kind} - ${track.label} - enabled: ${track.enabled}`);
      });

      this.localStream = mediaStream;
      this.onLocalStream?.(mediaStream);

      console.log('✅ Local stream ready');
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  private createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(this.peerConstraints);
    } catch (error) {
      console.error('❌ Failed to create RTCPeerConnection:', error);
      console.error('Make sure you have run "npx expo prebuild" and rebuilt the native app');
      throw error;
    }

    // Connection state change
    (this.peerConnection as any).addEventListener('connectionstatechange', () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state:', state);
      this.onConnectionStateChange?.(state || 'unknown');

      if (state === 'closed' || state === 'failed') {
        console.log('Connection closed or failed, cleaning up');
      }
    });

    // ICE candidate
    (this.peerConnection as any).addEventListener('icecandidate', (event: any) => {
      if (!event.candidate) {
        console.log('ICE gathering completed');
        return;
      }

      console.log('New ICE candidate:', event.candidate.candidate);
      // Send candidate to Firestore
      this.sendIceCandidate(event.candidate);
    });

    // ICE candidate error
    (this.peerConnection as any).addEventListener('icecandidateerror', (event: any) => {
      // Some candidate errors are normal and can be ignored
      console.log('ICE candidate error (can be ignored):', event.errorCode);
    });

    // ICE connection state change
    (this.peerConnection as any).addEventListener('iceconnectionstatechange', () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('ICE connection state:', state);
      this.onIceConnectionStateChange?.(state || 'unknown');

      if (state === 'connected' || state === 'completed') {
        console.log('✅ Call connected successfully');
      } else if (state === 'failed') {
        console.error('❌ ICE connection failed - may need TURN server');
      } else if (state === 'disconnected') {
        console.warn('⚠️ ICE connection disconnected');
      }
    });

    // Track event (remote stream)
    (this.peerConnection as any).addEventListener('track', (event: any) => {
      console.log('🎥 Remote track received:', event.track.kind);

      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }

      this.remoteStream.addTrack(event.track);

      // Notify about remote stream
      console.log('📺 Remote stream updated, total tracks:', this.remoteStream.getTracks().length);
      this.onRemoteStream?.(this.remoteStream);
    });

    // Signaling state change
    (this.peerConnection as any).addEventListener('signalingstatechange', () => {
      console.log('Signaling state:', this.peerConnection?.signalingState);
    });
  }

  private async createOffer() {
    if (!this.peerConnection) {
      console.error('❌ No peer connection available for offer');
      return;
    }

    try {
      console.log('📝 Creating offer...');
      const offerDescription = await this.peerConnection.createOffer(this.sessionConstraints);
      console.log('✅ Offer created');

      console.log('📝 Setting local description...');
      await this.peerConnection.setLocalDescription(offerDescription);
      console.log('✅ Local description set');

      // Save offer to Firestore
      if (firebaseFirestore && firestoreDoc && firestoreSetDoc) {
        console.log('💾 Saving offer to Firestore...');
        const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);
        await firestoreSetDoc(roomRef, {
          offer: {
            type: offerDescription.type,
            sdp: offerDescription.sdp,
          },
          createdAt: new Date().toISOString(),
        });
        console.log('✅ Offer saved to Firestore');
      }

      console.log('✅ Offer created and saved successfully');
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      throw error;
    }
  }

  private async createAnswer(offerDescription: any) {
    if (!this.peerConnection) {
      console.error('❌ No peer connection available for answer');
      return;
    }

    try {
      console.log('📝 Creating answer for offer');
      const offer = new RTCSessionDescription(offerDescription);
      await this.peerConnection.setRemoteDescription(offer);
      console.log('✅ Remote description (offer) set');

      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);
      console.log('✅ Local description (answer) set');

      // Save answer to Firestore
      if (firebaseFirestore && firestoreDoc && firestoreUpdateDoc) {
        const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);
        await firestoreUpdateDoc(roomRef, {
          answer: {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
          },
        });
        console.log('✅ Answer saved to Firestore');
      }

      // Process any queued candidates
      this.processCandidates();

      console.log('✅ Answer created and saved successfully');
    } catch (error) {
      console.error('❌ Error creating answer:', error);
      throw error;
    }
  }

  private async handleRemoteCandidate(candidateData: any) {
    try {
      const candidate = new RTCIceCandidate(candidateData);

      if (!this.peerConnection?.remoteDescription) {
        console.log('🔄 Queuing ICE candidate (no remote description yet)');
        this.remoteCandidates.push(candidate);
        return;
      }

      console.log('➕ Adding ICE candidate');
      await this.peerConnection.addIceCandidate(candidate);
      console.log('✅ ICE candidate added successfully');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }

  private async processCandidates() {
    if (this.remoteCandidates.length < 1) {
      console.log('No queued candidates to process');
      return;
    }

    console.log(`📦 Processing ${this.remoteCandidates.length} queued ICE candidates`);

    for (const candidate of this.remoteCandidates) {
      try {
        await this.peerConnection?.addIceCandidate(candidate);
        console.log('✅ Queued candidate added');
      } catch (error) {
        console.error('❌ Error adding queued candidate:', error);
      }
    }

    this.remoteCandidates = [];
    console.log('✅ All queued candidates processed');
  }

  private async sendIceCandidate(candidate: RTCIceCandidate) {
    const candidateData = {
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
    };

    const collectionName = this.isHost ? 'hostCandidates' : 'guestCandidates';

    try {
      if (firebaseFirestore && firestoreDoc && firestoreCollection && firestoreAddDoc) {
        const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);
        const candidatesRef = firestoreCollection(roomRef, collectionName);
        await firestoreAddDoc(candidatesRef, candidateData);
      }
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }

  private setupFirestoreListeners() {
    if (!firebaseFirestore || !firestoreDoc || !firestoreCollection || !firestoreOnSnapshot) {
      console.error('❌ Firestore not available');
      return;
    }

    const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);

    // Listen for offer (if guest)
    if (!this.isHost) {
      console.log('👂 Guest: Listening for offer...');
      firestoreOnSnapshot(roomRef, (snapshot: any) => {
        const data = snapshot.data();
        if (data?.offer && !this.peerConnection?.remoteDescription) {
          console.log('📨 Offer received, creating answer...');
          this.createAnswer(data.offer);
        }
      }, (error: any) => {
        console.error('❌ Error listening for offer:', error);
      });
    }

    // Listen for answer (if host)
    if (this.isHost) {
      console.log('👂 Host: Listening for answer...');
      firestoreOnSnapshot(roomRef, async (snapshot: any) => {
        const data = snapshot.data();
        if (data?.answer && !this.peerConnection?.remoteDescription) {
          try {
            console.log('📨 Answer received, setting remote description...');
            const answer = new RTCSessionDescription(data.answer);
            await this.peerConnection?.setRemoteDescription(answer);
            console.log('✅ Remote description (answer) set');
            await this.processCandidates();
          } catch (error) {
            console.error('❌ Error setting answer:', error);
          }
        }
      }, (error: any) => {
        console.error('❌ Error listening for answer:', error);
      });
    }

    // Listen for ICE candidates
    const remoteCandidatesCollection = this.isHost ? 'guestCandidates' : 'hostCandidates';
    const candidatesRef = firestoreCollection(roomRef, remoteCandidatesCollection);

    console.log(`👂 Listening for ICE candidates from: ${remoteCandidatesCollection}`);
    firestoreOnSnapshot(candidatesRef, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added') {
          console.log('📨 New ICE candidate received');
          this.handleRemoteCandidate(change.doc.data());
        }
      });
    }, (error: any) => {
      console.error('❌ Error listening for ICE candidates:', error);
    });
  }

  async toggleMute(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // Return muted state
    }
    return false;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled; // Return enabled state
    }
    return false;
  }

  async switchCamera() {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        // Modern approach for switching camera
        // @ts-ignore - switchCamera is available in react-native-webrtc
        if (typeof videoTrack.switchCamera === 'function') {
          // @ts-ignore
          await videoTrack.switchCamera();
        } else if (typeof videoTrack._switchCamera === 'function') {
          // Fallback to deprecated method
          // @ts-ignore
          videoTrack._switchCamera();
        }
      } catch (error) {
        console.error('Error switching camera:', error);
      }
    }
  }

  async endCall() {
    console.log('🔚 Ending call...');

    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('Peer connection closed');
    }

    // Clean up Firestore (if host)
    if (this.isHost && this.roomName && firebaseFirestore && firestoreDoc && firestoreDeleteDoc) {
      try {
        const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);
        await firestoreDeleteDoc(roomRef);
        console.log('Room cleaned up from Firestore');
      } catch (error) {
        console.error('Error cleaning up room:', error);
      }
    }

    this.cleanup();
    console.log('✅ Call ended successfully');
  }

  private cleanup() {
    this.localStream = null;
    this.remoteStream = null;
    this.remoteCandidates = [];
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}

export const webRTCService = new WebRTCService();
