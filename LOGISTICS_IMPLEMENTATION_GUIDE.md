# 🚚 Live Logistics Implementation Guide for AgroVia

## Current System Analysis

Your system currently has:
- ✅ Basic driver assignments (4 drivers with trucks)
- ✅ Order fulfillment workflow
- ✅ Simulated IoT truck tracking (visual animation)
- ✅ Temperature & humidity monitoring (simulated)
- ⚠️ No real-time GPS tracking
- ⚠️ No route optimization
- ⚠️ No delivery proof/confirmation
- ⚠️ No real-time notifications

---

## 🎯 Recommended Implementation Phases

### **PHASE 1: Foundation (Week 1-2)** - Essential Features

#### 1.1 Real-Time GPS Tracking Integration

**Technology Options:**

**Option A: Google Maps Platform (Recommended for MVP)**
```typescript
// Cost: ~$7 per 1000 requests
// Features: Routes API, Distance Matrix, Geocoding
// Pros: Reliable, well-documented, accurate in India
// Cons: Requires billing account

// Implementation:
import { Loader } from '@googlemaps/js-api-loader';

interface LiveLocation {
  lat: number;
  lng: number;
  timestamp: Date;
  speed: number;
  heading: number;
}

// Track driver location
const trackDriver = async (driverId: string) => {
  // Use Geolocation API from driver's mobile device
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const location: LiveLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(),
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0
        };
        // Send to backend/Firebase
        updateDriverLocation(driverId, location);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }
};
```

**Option B: MapMyIndia (Indian Alternative)**
```typescript
// Cost: More affordable for Indian market
// Features: Better Indian road data, vernacular support
// Pros: Optimized for India, cheaper
// Cons: Less global documentation

// API Integration
const MMI_API_KEY = 'your_mapmyindia_key';
const trackRoute = async (origin: string, destination: string) => {
  const response = await fetch(
    `https://apis.mapmyindia.com/advancedmaps/v1/${MMI_API_KEY}/route_adv/driving/${origin};${destination}`
  );
  return response.json();
};
```

**Option C: OpenStreetMap + Leaflet (Free)**
```typescript
// Cost: Free
// Pros: No API costs, open source
// Cons: Need to handle routing yourself, less accurate

import L from 'leaflet';
import 'leaflet-routing-machine';

const map = L.map('map').setView([18.5204, 73.8567], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Add routing
L.Routing.control({
  waypoints: [
    L.latLng(18.5204, 73.8567), // Pune
    L.latLng(19.0760, 72.8777)  // Mumbai
  ]
}).addTo(map);
```

#### 1.2 Backend Infrastructure

**Recommended: Firebase Realtime Database**
```typescript
// firebase-config.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  databaseURL: "https://agrovia-logistics.firebaseio.com",
  projectId: "agrovia-logistics"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Real-time driver location updates
export const subscribeToDriverLocation = (driverId: string, callback: (location: LiveLocation) => void) => {
  const locationRef = ref(db, `drivers/${driverId}/location`);
  return onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
};

// Update driver location (from driver's mobile app)
export const updateDriverLocation = (driverId: string, location: LiveLocation) => {
  set(ref(db, `drivers/${driverId}/location`), location);
};
```

**Alternative: Supabase (PostgreSQL + Realtime)**
```typescript
// More structured data, better for complex queries
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_URL', 'YOUR_KEY');

// Subscribe to location updates
const subscription = supabase
  .channel('driver-locations')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'driver_locations' },
    (payload) => {
      console.log('Location updated:', payload.new);
    }
  )
  .subscribe();
```

#### 1.3 Driver Mobile App (PWA)

**Create a simple PWA for drivers:**

```typescript
// src/pages/DriverApp.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DriverApp() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          // Send location to Firebase
          updateDriverLocation(driverId, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date(),
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      setWatchId(id);
      setIsTracking(true);
    }
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Driver Dashboard</h2>
        
        {currentOrder ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Delivery</p>
              <p className="text-xl font-bold">{currentOrder.orderId}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="font-medium">{currentOrder.retailerAddress}</p>
            </div>

            <Button 
              onClick={isTracking ? stopTracking : startTracking}
              className="w-full"
              variant={isTracking ? "destructive" : "default"}
            >
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Button>

            <Button 
              onClick={() => markDelivered(currentOrder.orderId)}
              className="w-full"
              variant="outline"
            >
              Mark as Delivered
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">No active deliveries</p>
        )}
      </Card>
    </div>
  );
}
```

---

### **PHASE 2: Enhanced Features (Week 3-4)**

#### 2.1 Route Optimization

**Using Google Routes API:**
```typescript
// src/lib/routeOptimization.ts
interface Waypoint {
  orderId: string;
  address: string;
  lat: number;
  lng: number;
  priority: 'high' | 'medium' | 'low';
}

export const optimizeRoute = async (
  origin: { lat: number; lng: number },
  waypoints: Waypoint[]
): Promise<OptimizedRoute> => {
  // Sort by priority and proximity
  const sortedWaypoints = waypoints.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    
    // Calculate distance from origin
    const distA = calculateDistance(origin, { lat: a.lat, lng: a.lng });
    const distB = calculateDistance(origin, { lat: b.lat, lng: b.lng });
    return distA - distB;
  });

  // Use Google Routes API for optimal path
  const response = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline'
      },
      body: JSON.stringify({
        origin: { location: { latLng: origin } },
        destination: { location: { latLng: sortedWaypoints[sortedWaypoints.length - 1] } },
        intermediates: sortedWaypoints.slice(0, -1).map(w => ({
          location: { latLng: { lat: w.lat, lng: w.lng } }
        })),
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        computeAlternativeRoutes: false,
        optimizeWaypointOrder: true
      })
    }
  );

  return response.json();
};

// Haversine formula for distance calculation
const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

#### 2.2 ETA Calculation

```typescript
// src/lib/etaCalculation.ts
interface ETAParams {
  currentLocation: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  currentSpeed: number; // km/h
  trafficFactor?: number; // 1.0 = normal, 1.5 = heavy traffic
}

export const calculateETA = async (params: ETAParams): Promise<{
  eta: Date;
  distance: number;
  duration: number;
}> => {
  const { currentLocation, destination, currentSpeed, trafficFactor = 1.0 } = params;

  // Get route from Google Distance Matrix API
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `origins=${currentLocation.lat},${currentLocation.lng}&` +
    `destinations=${destination.lat},${destination.lng}&` +
    `departure_time=now&` +
    `traffic_model=best_guess&` +
    `key=${GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();
  const element = data.rows[0].elements[0];

  if (element.status === 'OK') {
    const durationInSeconds = element.duration_in_traffic?.value || element.duration.value;
    const adjustedDuration = durationInSeconds * trafficFactor;
    
    return {
      eta: new Date(Date.now() + adjustedDuration * 1000),
      distance: element.distance.value / 1000, // Convert to km
      duration: adjustedDuration / 60 // Convert to minutes
    };
  }

  throw new Error('Unable to calculate ETA');
};

// Real-time ETA updates
export const subscribeToETAUpdates = (
  orderId: string,
  callback: (eta: Date) => void
) => {
  const interval = setInterval(async () => {
    const order = getOrderById(orderId);
    const driver = getDriverForOrder(orderId);
    
    if (order && driver && driver.currentLocation) {
      const result = await calculateETA({
        currentLocation: driver.currentLocation,
        destination: order.deliveryLocation,
        currentSpeed: driver.currentSpeed || 40
      });
      
      callback(result.eta);
    }
  }, 30000); // Update every 30 seconds

  return () => clearInterval(interval);
};
```

#### 2.3 Push Notifications

**Using Firebase Cloud Messaging:**

```typescript
// src/lib/notifications.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export const initializeNotifications = async () => {
  const messaging = getMessaging();
  
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });
    
    // Send token to backend
    await saveNotificationToken(token);
    
    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      showNotification(payload.notification);
    });
  } catch (error) {
    console.error('Notification permission denied');
  }
};

// Notification triggers
export const sendDeliveryNotifications = {
  orderDispatched: (order: Order) => {
    sendNotification({
      title: '📦 Order Dispatched',
      body: `Your order ${order.orderId} is on the way!`,
      recipients: [order.retailerId],
      data: { orderId: order.orderId, type: 'dispatched' }
    });
  },
  
  driverNearby: (order: Order, eta: number) => {
    sendNotification({
      title: '🚚 Driver Nearby',
      body: `Your delivery will arrive in ${eta} minutes`,
      recipients: [order.retailerId],
      data: { orderId: order.orderId, type: 'nearby' }
    });
  },
  
  delivered: (order: Order) => {
    sendNotification({
      title: '✅ Delivered',
      body: `Order ${order.orderId} has been delivered successfully`,
      recipients: [order.retailerId, order.warehouseId],
      data: { orderId: order.orderId, type: 'delivered' }
    });
  },
  
  delayed: (order: Order, reason: string) => {
    sendNotification({
      title: '⚠️ Delivery Delayed',
      body: `Order ${order.orderId} is delayed: ${reason}`,
      recipients: [order.retailerId],
      data: { orderId: order.orderId, type: 'delayed' }
    });
  }
};
```

---

### **PHASE 3: Advanced Features (Week 5-6)**

#### 3.1 Delivery Proof System

```typescript
// src/components/DeliveryProof.tsx
import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DeliveryProof {
  orderId: string;
  photo: string; // Base64 or URL
  signature: string; // Base64 signature
  recipientName: string;
  recipientPhone: string;
  deliveryNotes?: string;
  timestamp: Date;
  location: { lat: number; lng: number };
}

export function DeliveryProofCapture({ orderId }: { orderId: string }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      setPhoto(photoData);
      
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera access denied');
    }
  };

  const submitProof = async () => {
    const location = await getCurrentLocation();
    
    const proof: DeliveryProof = {
      orderId,
      photo: photo!,
      signature: signature!,
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      deliveryNotes: notes,
      timestamp: new Date(),
      location
    };

    // Upload to Firebase Storage
    await uploadDeliveryProof(proof);
    
    // Update order status
    await updateOrderStatus(orderId, 'Delivered', proof);
  };

  return (
    <div className="space-y-4">
      <Button onClick={capturePhoto} className="w-full">
        <Camera className="mr-2" /> Capture Delivery Photo
      </Button>
      
      {photo && <img src={photo} alt="Delivery" className="rounded-lg" />}
      
      <SignaturePad onSave={setSignature} />
      
      <Input placeholder="Recipient Name" />
      <Input placeholder="Recipient Phone" />
      <Input placeholder="Delivery Notes (optional)" />
      
      <Button 
        onClick={submitProof} 
        disabled={!photo || !signature}
        className="w-full"
      >
        Complete Delivery
      </Button>
    </div>
  );
}
```

#### 3.2 Temperature Monitoring (IoT Integration)

**For real cold chain monitoring:**

```typescript
// src/lib/iotMonitoring.ts
interface TemperatureReading {
  deviceId: string;
  truckId: string;
  temperature: number;
  humidity: number;
  timestamp: Date;
  location: { lat: number; lng: number };
  batteryLevel?: number;
}

// Connect to IoT device via MQTT
import mqtt from 'mqtt';

export class ColdChainMonitor {
  private client: mqtt.MqttClient;
  
  constructor(brokerUrl: string) {
    this.client = mqtt.connect(brokerUrl);
  }

  subscribeToTruck(truckId: string, callback: (reading: TemperatureReading) => void) {
    this.client.subscribe(`trucks/${truckId}/sensors`);
    
    this.client.on('message', (topic, message) => {
      const data = JSON.parse(message.toString());
      
      // Alert if temperature exceeds threshold
      if (data.temperature > 8 || data.temperature < 2) {
        this.sendTemperatureAlert(truckId, data);
      }
      
      callback(data);
    });
  }

  private sendTemperatureAlert(truckId: string, reading: TemperatureReading) {
    sendNotification({
      title: '🌡️ Temperature Alert',
      body: `Truck ${truckId} temperature: ${reading.temperature}°C (Critical!)`,
      recipients: ['warehouse-manager', 'logistics-head'],
      priority: 'high'
    });
  }
}

// Usage
const monitor = new ColdChainMonitor('mqtt://broker.hivemq.com');
monitor.subscribeToTruck('TRK-01', (reading) => {
  console.log('Temperature:', reading.temperature);
  updateDashboard(reading);
});
```

#### 3.3 Analytics Dashboard

```typescript
// src/pages/LogisticsAnalytics.tsx
export default function LogisticsAnalytics() {
  const [metrics, setMetrics] = useState({
    avgDeliveryTime: 0,
    onTimeDeliveryRate: 0,
    totalDistanceCovered: 0,
    fuelEfficiency: 0,
    temperatureViolations: 0
  });

  useEffect(() => {
    // Calculate metrics from historical data
    const orders = getAllOrders();
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    
    const avgTime = deliveredOrders.reduce((sum, o) => {
      const time = o.fulfillmentDate!.getTime() - o.orderDate.getTime();
      return sum + time;
    }, 0) / deliveredOrders.length;

    setMetrics({
      avgDeliveryTime: avgTime / (1000 * 60 * 60), // hours
      onTimeDeliveryRate: calculateOnTimeRate(deliveredOrders),
      totalDistanceCovered: calculateTotalDistance(deliveredOrders),
      fuelEfficiency: calculateFuelEfficiency(deliveredOrders),
      temperatureViolations: countTemperatureViolations()
    });
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard 
        title="Avg Delivery Time"
        value={`${metrics.avgDeliveryTime.toFixed(1)} hrs`}
        trend="+5%"
      />
      <MetricCard 
        title="On-Time Rate"
        value={`${metrics.onTimeDeliveryRate}%`}
        trend="+12%"
      />
      <MetricCard 
        title="Distance Covered"
        value={`${metrics.totalDistanceCovered} km`}
      />
    </div>
  );
}
```

---

### **PHASE 4: Integration & Optimization (Week 7-8)**

#### 4.1 WhatsApp Integration for Updates

```typescript
// Using Twilio WhatsApp API
import twilio from 'twilio';

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

export const sendWhatsAppUpdate = async (
  to: string,
  order: Order,
  trackingLink: string
) => {
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body: `
🚚 *AgroVia Delivery Update*

Order: ${order.orderId}
Status: On the way
Driver: ${order.assignedDriverName}
Truck: ${order.assignedTruckNumber}

Track live: ${trackingLink}

ETA: 45 minutes
    `.trim()
  });
};
```

#### 4.2 Geofencing for Auto-Updates

```typescript
// src/lib/geofencing.ts
interface Geofence {
  center: { lat: number; lng: number };
  radius: number; // meters
  type: 'warehouse' | 'retailer' | 'checkpoint';
}

export const checkGeofence = (
  currentLocation: { lat: number; lng: number },
  geofence: Geofence
): boolean => {
  const distance = calculateDistance(currentLocation, geofence.center);
  return distance * 1000 <= geofence.radius; // Convert km to meters
};

// Auto-trigger events when entering geofence
export const monitorGeofences = (
  driverId: string,
  geofences: Geofence[]
) => {
  subscribeToDriverLocation(driverId, (location) => {
    geofences.forEach(fence => {
      if (checkGeofence(location, fence)) {
        handleGeofenceEntry(driverId, fence);
      }
    });
  });
};

const handleGeofenceEntry = (driverId: string, fence: Geofence) => {
  if (fence.type === 'retailer') {
    // Driver reached destination
    sendNotification({
      title: '📍 Driver Arrived',
      body: 'Your delivery has arrived!',
      recipients: [getRetailerForDriver(driverId)]
    });
  }
};
```

---

## 💰 Cost Estimation

### Monthly Costs (for 100 deliveries/day)

| Service | Cost | Notes |
|---------|------|-------|
| Google Maps API | $200-300 | Routes, Distance Matrix, Geocoding |
| Firebase (Realtime DB + Storage) | $50-100 | Real-time location + photos |
| Twilio WhatsApp | $50-100 | ~3000 messages/month |
| IoT Sensors (optional) | $500-1000 | One-time hardware cost per truck |
| **Total Monthly** | **$300-500** | Without IoT hardware |

### Free Alternatives
- OpenStreetMap + Leaflet: $0
- Supabase Free Tier: $0 (up to 500MB)
- Self-hosted MQTT broker: $10-20/month

---

## 🚀 Quick Start Implementation

### Minimal Viable Product (1 Week)

```typescript
// 1. Add to your existing Order interface
interface Order {
  // ... existing fields
  trackingUrl?: string;
  currentLocation?: { lat: number; lng: number };
  estimatedArrival?: Date;
  deliveryStatus?: 'dispatched' | 'in_transit' | 'nearby' | 'delivered';
}

// 2. Create simple tracking page
// src/pages/TrackOrder.tsx
export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const trackOrder = () => {
    const found = getAllOrders().find(o => o.orderId === orderId);
    setOrder(found || null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Input 
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
      />
      <Button onClick={trackOrder}>Track Order</Button>

      {order && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order {order.orderId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusTimeline order={order} />
              <DriverInfo driver={order.assignedDriverName} />
              <ETADisplay eta={order.estimatedArrival} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## 📱 Recommended Tech Stack

### For Production:
1. **Maps**: Google Maps Platform (most reliable)
2. **Backend**: Firebase (easiest real-time)
3. **Notifications**: Firebase Cloud Messaging
4. **Storage**: Firebase Storage (for delivery photos)
5. **Analytics**: Google Analytics + Custom Dashboard

### For Budget-Conscious:
1. **Maps**: MapMyIndia or OpenStreetMap
2. **Backend**: Supabase (PostgreSQL + Realtime)
3. **Notifications**: OneSignal (free tier)
4. **Storage**: Supabase Storage
5. **Analytics**: Self-hosted Plausible

---

## 🎯 Priority Features to Implement First

1. ✅ **Real-time location tracking** (Week 1)
2. ✅ **ETA calculation** (Week 1)
3. ✅ **Push notifications** (Week 2)
4. ✅ **Delivery proof capture** (Week 2)
5. ⏳ Route optimization (Week 3)
6. ⏳ Temperature monitoring (Week 4)
7. ⏳ Analytics dashboard (Week 4)

---

## 📞 Next Steps

1. Choose your mapping provider (Google Maps recommended)
2. Set up Firebase project
3. Implement driver mobile app (PWA)
4. Add real-time location updates
5. Test with 1-2 drivers
6. Roll out to all drivers
7. Add advanced features incrementally

Would you like me to implement any specific feature from this guide?
