// Dummy data for the driver app

export const dummyManifest = {
    routeId: 'ROUTE-892-B',
    date: 'Thursday, Oct 24',
    totalStops: 12,
    estimatedDuration: '4h 20m',
    totalDistance: 45,
    assignedCrew: [
        {
            id: 'CREW-001',
            name: 'Marcus Johnson',
            photo: 'https://randomuser.me/api/portraits/men/15.jpg',
            role: 'Loader',
            boarded: false
        },
        {
            id: 'CREW-002',
            name: 'Sarah Chen',
            photo: 'https://randomuser.me/api/portraits/women/22.jpg',
            role: 'Loader',
            boarded: false
        }
    ]
}

export const dummyStops = [
    {
        id: 'STOP-001',
        stopNumber: 1,
        type: 'express',
        customerName: 'TechCorp HQ',
        address: '800 Market St, San Francisco, CA',
        distance: 3.2,
        packages: [
            { id: 'PKG-001', scanned: false },
            { id: 'PKG-002', scanned: false },
            { id: 'PKG-003', scanned: false }
        ],
        serviceType: 'Parcel',
        paymentType: 'Prepaid',
        specialInstructions: 'Deliver to reception desk',
        eta: '10:15 AM',
        location: { lat: 37.7893, lng: -122.3997 }
    },
    {
        id: 'STOP-002',
        stopNumber: 2,
        type: 'move',
        customerName: 'Sarah Jenkins',
        address: '1242 Maple Drive, Daly City, CA',
        distance: 8.5,
        packages: [],
        serviceType: 'Move',
        paymentType: 'COD',
        specialInstructions: '2nd floor apartment, no elevator',
        eta: '11:00 AM',
        location: { lat: 37.6879, lng: -122.4702 },
        moveItems: ['Sofa', 'Dining Table', '15 Boxes']
    },
    {
        id: 'STOP-003',
        stopNumber: 3,
        type: 'standard',
        customerName: 'Warehouse B',
        address: 'Industrial Park Way, South SF',
        distance: 5.3,
        packages: [
            { id: 'PKG-004', scanned: false },
            { id: 'PKG-005', scanned: false }
        ],
        serviceType: 'Parcel',
        paymentType: 'Prepaid',
        specialInstructions: 'Ring bell at loading dock',
        eta: '12:00 PM',
        location: { lat: 37.6547, lng: -122.4077 }
    },
    {
        id: 'STOP-004',
        stopNumber: 4,
        type: 'standard',
        customerName: 'Green Logistics Hub',
        address: '550 Terry Francois St, SF',
        distance: 4.8,
        packages: [
            { id: 'PKG-006', scanned: false }
        ],
        serviceType: 'Parcel',
        paymentType: 'Prepaid',
        specialInstructions: null,
        eta: '12:45 PM',
        location: { lat: 37.7711, lng: -122.3876 }
    },
    {
        id: 'STOP-005',
        stopNumber: 5,
        type: 'express',
        customerName: 'Dr. Patricia Williams',
        address: '2450 Sutter St, San Francisco, CA',
        distance: 3.7,
        packages: [
            { id: 'PKG-007', scanned: false }
        ],
        serviceType: 'Parcel',
        paymentType: 'COD',
        specialInstructions: 'Medical supplies - handle with care',
        eta: '1:30 PM',
        location: { lat: 37.7858, lng: -122.4364 }
    },
    {
        id: 'STOP-006',
        stopNumber: 6,
        type: 'pickup',
        customerName: 'Return Center Inc',
        address: '8800 Business Park Dr',
        distance: 2.1,
        packages: [],
        pickupItems: [
            { id: 'RET-001', description: 'Defective Monitor', condition: 'unknown' },
            { id: 'RET-002', description: 'Unopened Keyboard', condition: 'sealed' }
        ],
        serviceType: 'Pickup',
        paymentType: 'Prepaid',
        specialInstructions: 'Go to rear loading dock',
        eta: '2:15 PM',
        location: { lat: 37.75, lng: -122.41 }
    },
    {
        id: 'STOP-007',
        stopNumber: 7,
        type: 'exchange',
        customerName: 'Sarah Connor',
        address: '101 Cyberdyne Ave',
        distance: 1.5,
        packages: [
            { id: 'PKG-777', scanned: false }
        ],
        pickupItems: [
            { id: 'RET-999', description: 'Wrong Size Shirt', condition: 'opened' }
        ],
        serviceType: 'Exchange',
        paymentType: 'Prepaid',
        specialInstructions: 'Code 1984 for gate',
        eta: '3:00 PM',
        location: { lat: 37.76, lng: -122.42 }
    }
]

export const dummyVehicle = {
    vehicleId: 'V-2049',
    plateNumber: 'XYZ-888-CA',
    type: 'Electric Delivery Van',
    fuelLevel: 85,
    range: 240,
    capacity: 1.2,
    seats: 2,
    odometer: 45280,
    lastInspection: '2024-10-20',
    status: 'Good'
}

export const dummyDriver = {
    id: 'DRV-2049',
    name: 'John Mitchell',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.9,
    onTimePercentage: 96,
    fuelEfficiency: 8,
    totalDeliveries: 1247,
    safetyScore: 98
}

export const dummyEarnings = {
    today: {
        basePay: 120,
        tips: 25,
        bonuses: 15,
        codHandled: 0
    },
    weekly: {
        basePay: 650,
        tips: 130,
        bonuses: 75,
        codHandled: 0
    },
    performance: {
        rating: 4.9,
        onTimePercentage: 96,
        fuelEfficiency: 8,
        totalDeliveries: 22
    }
}
