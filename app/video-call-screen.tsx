import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RTCView } from 'react-native-webrtc';
import { webRTCService } from '../services/WebRTCService';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const params = useLocalSearchParams();
  const roomName = params.roomName as string;
  const isHost = params.isHost === 'true';

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [localStreamURL, setLocalStreamURL] = useState<string | null>(null);
  const [remoteStreamURL, setRemoteStreamURL] = useState<string | null>(null);

  useEffect(() => {
    initializeCall();

    return () => {
      webRTCService.endCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      setConnectionStatus(isHost ? 'Creating room...' : 'Joining room...');

      // Setup callbacks
      webRTCService.onLocalStream = (stream) => {
        console.log('Local stream received');
        setLocalStreamURL(stream.toURL());
        setConnectionStatus(isHost ? 'Waiting for guest...' : 'Connecting...');
      };

      webRTCService.onRemoteStream = (stream) => {
        console.log('Remote stream received, URL:', stream.toURL());
        setRemoteStreamURL(stream.toURL());
        setConnectionStatus('Connected');
      };

      webRTCService.onConnectionStateChange = (state) => {
        console.log('Connection state changed:', state);
        
        switch (state) {
          case 'connecting':
            setConnectionStatus('Connecting...');
            break;
          case 'connected':
            setConnectionStatus('Connected');
            setIsConnected(true);
            break;
          case 'disconnected':
            setConnectionStatus('Disconnected');
            setIsConnected(false);
            break;
          case 'failed':
            setConnectionStatus('Connection failed');
            setIsConnected(false);
            Alert.alert(
              'Connection Failed',
              'Unable to establish connection. Please check your internet and try again.',
              [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]
            );
            break;
          case 'closed':
            setConnectionStatus('Call ended');
            break;
        }
      };

      webRTCService.onIceConnectionStateChange = (state) => {
        console.log('ICE connection state changed:', state);
        
        switch (state) {
          case 'checking':
            setConnectionStatus('Establishing connection...');
            break;
          case 'connected':
          case 'completed':
            setConnectionStatus('Connected');
            setIsConnected(true);
            break;
          case 'disconnected':
            setConnectionStatus('Connection lost');
            setIsConnected(false);
            break;
          case 'failed':
            setConnectionStatus('Connection failed');
            setIsConnected(false);
            break;
        }
      };

      // Start the call
      await webRTCService.startCall(roomName, isHost, false);
    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert('Error', 'Failed to start call. Please try again.');
      router.back();
    }
  };

  useEffect(() => {
    // Update call duration every second when connected
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = async () => {
    const muted = await webRTCService.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleVideo = async () => {
    const enabled = await webRTCService.toggleVideo();
    setIsVideoEnabled(enabled);
  };

  const handleSwitchCamera = async () => {
    await webRTCService.switchCamera();
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: async () => {
            await webRTCService.endCall();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Remote Video View (Full Screen) */}
      <View style={styles.remoteVideoContainer}>
        {remoteStreamURL ? (
          <RTCView
            streamURL={remoteStreamURL}
            style={styles.remoteVideo}
            objectFit="cover"
            mirror={false}
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons 
              name={isConnected ? "person" : "videocam"} 
              size={80} 
              color="#666" 
            />
            <Text style={styles.placeholderText}>
              {connectionStatus}
            </Text>
            {!isConnected && (
              <Text style={styles.placeholderSubtext}>
                {isHost ? 'Share room name with others to join' : 'Waiting for host...'}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Local Video View (Picture-in-Picture) */}
      {isVideoEnabled && localStreamURL && (
        <View style={styles.localVideoContainer}>
          <RTCView
            streamURL={localStreamURL}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
            zOrder={1}
          />
          <TouchableOpacity 
            style={styles.switchCameraButton}
            onPress={handleSwitchCamera}
          >
            <Ionicons name="camera-reverse" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Top Info Bar */}
      <View style={styles.topBar}>
        <View style={styles.roomInfo}>
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.roomName}>{roomName}</Text>
        </View>
        {isConnected && (
          <View style={styles.durationContainer}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          {/* Mute/Unmute Button */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={handleToggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color="#fff"
            />
            <Text style={styles.controlLabel}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* Video On/Off Button */}
          <TouchableOpacity
            style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
            onPress={handleToggleVideo}
          >
            <Ionicons
              name={isVideoEnabled ? 'videocam' : 'videocam-off'}
              size={28}
              color="#fff"
            />
            <Text style={styles.controlLabel}>
              {isVideoEnabled ? 'Stop Video' : 'Start Video'}
            </Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={28} color="#fff" />
            <Text style={styles.controlLabel}>End Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Messages */}
      {!isConnected && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{connectionStatus}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  connectingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: width * 0.3,
    height: height * 0.2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#2a2a2a',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  switchCameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  localPlaceholderText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  endCallButton: {
    backgroundColor: '#ff3b30',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  statusContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
