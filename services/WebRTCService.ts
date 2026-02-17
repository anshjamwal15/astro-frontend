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
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Public TURN servers for better connectivity
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
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

    try {
      // Step 1: Get user media
      await this.getUserMedia(isVoiceOnly);

      // Step 2: Create peer connection
      this.createPeerConnection();

      // Step 3: Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }

      // Step 4: Setup Firestore listeners for signaling
      this.setupFirestoreListeners();

      // Step 5: If host, create offer
      if (isHost) {
        await this.createOffer();
      }

      return true;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  private async getUserMedia(isVoiceOnly: boolean) {
    const mediaConstraints = {
      audio: true,
      video: {
        frameRate: 30,
        facingMode: 'user',
      },
    };

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);
      
      if (isVoiceOnly) {
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false;
        }
      }

      this.localStream = mediaStream;
      this.onLocalStream?.(mediaStream);
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  private createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.peerConstraints);

    // Connection state change
    (this.peerConnection as any).addEventListener('connectionstatechange', () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state:', state);
      this.onConnectionStateChange?.(state || 'unknown');

      if (state === 'closed') {
        this.cleanup();
      }
    });

    // ICE candidate
    (this.peerConnection as any).addEventListener('icecandidate', (event: any) => {
      if (!event.candidate) {
        console.log('ICE gathering completed');
        return;
      }

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
        console.log('Call connected successfully');
      } else if (state === 'failed') {
        console.error('ICE connection failed - may need TURN server');
      }
    });

    // Track event (remote stream)
    (this.peerConnection as any).addEventListener('track', (event: any) => {
      console.log('Remote track received');
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      this.remoteStream.addTrack(event.track);
      this.onRemoteStream?.(this.remoteStream);
    });

    // Signaling state change
    (this.peerConnection as any).addEventListener('signalingstatechange', () => {
      console.log('Signaling state:', this.peerConnection?.signalingState);
    });
  }

  private async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offerDescription = await this.peerConnection.createOffer(this.sessionConstraints);
      await this.peerConnection.setLocalDescription(offerDescription);

      // Save offer to Firestore
      if (firebaseFirestore && firestoreDoc && firestoreSetDoc) {
        const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);
        await firestoreSetDoc(roomRef, {
          offer: {
            type: offerDescription.type,
            sdp: offerDescription.sdp,
          },
          createdAt: new Date().toISOString(),
        });
      }

      console.log('Offer created and saved');
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  private async createAnswer(offerDescription: any) {
    if (!this.peerConnection) return;

    try {
      const offer = new RTCSessionDescription(offerDescription);
      await this.peerConnection.setRemoteDescription(offer);

      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);

      // Save answer to Firestore
      if (firebaseFirestore && firestoreDoc && firestoreUpdateDoc) {
        const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);
        await firestoreUpdateDoc(roomRef, {
          answer: {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
          },
        });
      }

      // Process any queued candidates
      this.processCandidates();

      console.log('Answer created and saved');
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  private async handleRemoteCandidate(candidateData: any) {
    const candidate = new RTCIceCandidate(candidateData);

    if (!this.peerConnection?.remoteDescription) {
      this.remoteCandidates.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  private processCandidates() {
    if (this.remoteCandidates.length < 1) return;

    this.remoteCandidates.forEach(candidate => {
      this.peerConnection?.addIceCandidate(candidate);
    });

    this.remoteCandidates = [];
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
      console.error('Firestore not available');
      return;
    }

    const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);

    // Listen for offer (if guest)
    if (!this.isHost) {
      firestoreOnSnapshot(roomRef, (snapshot: any) => {
        const data = snapshot.data();
        if (data?.offer && !this.peerConnection?.remoteDescription) {
          this.createAnswer(data.offer);
        }
      });
    }

    // Listen for answer (if host)
    if (this.isHost) {
      firestoreOnSnapshot(roomRef, async (snapshot: any) => {
        const data = snapshot.data();
        if (data?.answer && !this.peerConnection?.remoteDescription) {
          const answer = new RTCSessionDescription(data.answer);
          await this.peerConnection?.setRemoteDescription(answer);
          this.processCandidates();
        }
      });
    }

    // Listen for ICE candidates
    const remoteCandidatesCollection = this.isHost ? 'guestCandidates' : 'hostCandidates';
    const candidatesRef = firestoreCollection(roomRef, remoteCandidatesCollection);
    
    firestoreOnSnapshot(candidatesRef, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added') {
          this.handleRemoteCandidate(change.doc.data());
        }
      });
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
      // @ts-ignore - _switchCamera is available in react-native-webrtc
      if (videoTrack._switchCamera) {
        // @ts-ignore
        videoTrack._switchCamera();
      }
    }
  }

  async endCall() {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clean up Firestore (if host)
    if (this.isHost && this.roomName && firebaseFirestore && firestoreDoc && firestoreDeleteDoc) {
      try {
        const roomRef = firestoreDoc(firebaseFirestore, 'rooms', this.roomName);
        await firestoreDeleteDoc(roomRef);
      } catch (error) {
        console.error('Error cleaning up room:', error);
      }
    }

    this.cleanup();
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
