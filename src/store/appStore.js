import { create } from 'zustand';

const initialInstrument = {
  id: "LM-TG-WE-00018472",
  type: "Electronic Weighing Scale",
  manufacturer: "WeighTech India",
  model: "WT-150",
  serial: "XYZ123847",
  capacity: "150 kg",
  accuracyClass: "III",
  owner: "ABC Traders",
  location: "Hyderabad, Telangana",
  registeredDate: "2024-09-06",
  status: "VERIFIED"
};

const initialOwner = {
  id: "owner-001",
  name: "Rajesh Kumar",
  email: "rajesh@abctraders.com",
  total: 47,
  verified: 38,
  expiringsSoon: 6,
  pendingApps: 2
};

const initialApplications = [
  {
    id: "APP-2026-009283",
    instrumentId: "LM-TG-WE-00018472",
    ownerId: "owner-001",
    status: "PENDING_ASSIGNMENT",
    verifyType: "Re-verification",
    preferredDate: "2026-09-15",
    lmoAssigned: null,
    createdAt: "2026-09-08"
  }
];

const initialLmos = [
  {
    id: "LMO-027",
    name: "Rajesh Sharma",
    specialization: ["Weighing Instruments"],
    distance: "4.2 km",
    workload: 6,
    authorized: true,
    jurisdiction: "Zone 4, Hyderabad Division",
    contact: "+91 98480 12345"
  }
];

const initialCertificates = [
  {
    id: "LM-CERT-938274",
    instrumentId: "LM-TG-WE-00018472",
    status: "ACTIVE",
    issuedDate: "2026-09-06",
    validUntil: "2027-09-05",
    verifiedBy: "LMO-027"
  }
];

const initialMeasurements = [
  { load: "0 kg", observed: "0.00 kg", tolerance: "±0.02", result: "PASS" },
  { load: "10 kg", observed: "10.01 kg", tolerance: "±0.02", result: "PASS" },
  { load: "20 kg", observed: "20.00 kg", tolerance: "±0.02", result: "PASS" },
  { load: "50 kg", observed: "50.02 kg", tolerance: "±0.03", result: "PASS" },
  { load: "100 kg", observed: "100.01 kg", tolerance: "±0.05", result: "PASS" }
];

export const useAppStore = create((set, get) => ({
  // Authentication State
  currentUser: {
    role: 'OWNER',
    name: 'Rajesh Kumar',
    email: 'rajesh@abctraders.com'
  },

  // Main Domain Entities
  instrument: { ...initialInstrument },
  owner: { ...initialOwner },
  applications: [...initialApplications],
  lmos: [...initialLmos],
  certificates: [...initialCertificates],

  // Field Verification Session State
  fieldVerification: {
    scanned: false,
    photos: {
      instrument: false,
      serial: false,
      display: false,
      mark: false
    },
    timestamps: {},
    measurements: [...initialMeasurements],
    inspectionChecks: {
      condition: "PASS",
      display: "PASS",
      seal: "PASS"
    },
    confirmed: false
  },

  // Store Actions
  setCurrentUser: (user) => set({ currentUser: user }),

  submitApplication: (newApp) => {
    const defaultApp = {
      id: "APP-2026-" + Math.floor(100000 + Math.random() * 900000),
      instrumentId: get().instrument.id,
      ownerId: get().owner.id,
      status: "PENDING_ASSIGNMENT",
      verifyType: "Re-verification",
      preferredDate: "2026-09-15",
      lmoAssigned: null,
      createdAt: new Date().toISOString().split('T')[0],
      ...newApp
    };

    set((state) => ({
      applications: [defaultApp, ...state.applications.filter(a => a.id !== defaultApp.id)],
      owner: {
        ...state.owner,
        pendingApps: state.owner.pendingApps + 1
      }
    }));

    return defaultApp;
  },

  assignLMO: (applicationId, lmoId) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === applicationId
          ? { ...app, status: "SCHEDULED", lmoAssigned: lmoId }
          : app
      )
    }));
  },

  completeVerification: () => {
    const todayStr = "2026-09-08";
    const nextYearStr = "2027-09-07";

    set((state) => {
      const updatedApplications = state.applications.map((app) =>
        app.instrumentId === state.instrument.id
          ? { ...app, status: "COMPLETED", completedDate: todayStr }
          : app
      );

      const existingCert = state.certificates.find(c => c.instrumentId === state.instrument.id);
      const updatedCertificates = existingCert
        ? state.certificates.map(c =>
            c.id === existingCert.id
              ? { ...c, status: "ACTIVE", issuedDate: todayStr, validUntil: nextYearStr, verifiedBy: "LMO-027" }
              : c
          )
        : [
            ...state.certificates,
            {
              id: "LM-CERT-938274",
              instrumentId: state.instrument.id,
              status: "ACTIVE",
              issuedDate: todayStr,
              validUntil: nextYearStr,
              verifiedBy: "LMO-027"
            }
          ];

      return {
        instrument: {
          ...state.instrument,
          status: "VERIFIED"
        },
        applications: updatedApplications,
        certificates: updatedCertificates,
        owner: {
          ...state.owner,
          verified: state.owner.verified + 1,
          pendingApps: Math.max(0, state.owner.pendingApps - 1)
        }
      };
    });
  },

  // Getters
  getCertificateById: (id) => {
    return get().certificates.find((c) => c.id === id) || get().certificates[0];
  },

  getLMOById: (id) => {
    return get().lmos.find((l) => l.id === id) || get().lmos[0];
  },

  getApplicationById: (id) => {
    return get().applications.find((a) => a.id === id) || get().applications[0];
  },

  // Field Verification Actions
  setFieldVerificationScanned: (status) => {
    set((state) => ({
      fieldVerification: {
        ...state.fieldVerification,
        scanned: status
      }
    }));
  },

  capturePhoto: (photoKey) => {
    const now = "08 Sep 2026, 14:32 IST";
    set((state) => ({
      fieldVerification: {
        ...state.fieldVerification,
        photos: {
          ...state.fieldVerification.photos,
          [photoKey]: true
        },
        timestamps: {
          ...state.fieldVerification.timestamps,
          [photoKey]: now
        }
      }
    }));
  },

  toggleInspectionCheck: (checkKey, val) => {
    set((state) => ({
      fieldVerification: {
        ...state.fieldVerification,
        inspectionChecks: {
          ...state.fieldVerification.inspectionChecks,
          [checkKey]: val
        }
      }
    }));
  },

  resetDemoData: () => {
    set({
      instrument: { ...initialInstrument },
      owner: { ...initialOwner },
      applications: [...initialApplications],
      lmos: [...initialLmos],
      certificates: [...initialCertificates],
      fieldVerification: {
        scanned: false,
        photos: { instrument: false, serial: false, display: false, mark: false },
        timestamps: {},
        measurements: [...initialMeasurements],
        inspectionChecks: { condition: "PASS", display: "PASS", seal: "PASS" },
        confirmed: false
      }
    });
  }
}));
