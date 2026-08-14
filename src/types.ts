/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  userEmail: string;
  tripcode: string;
  lat: number;
  lng: number;
  locationName: string;
  notes?: string;
  timestamp: number;
}

export interface SportRecord {
  id: string;
  userId: string;
  userEmail: string;
  type: string;
  duration: number; // minutes
  distance?: number; // km
  calories?: number;
  notes?: string;
  date: string;
  timestamp: number;
}

export interface FlagMark {
  id: string;
  userId: string;
  countryId: string;
  visited: boolean;
  timestamp: number;
}

export type Page = 'home' | 'checkin' | 'records' | 'profile' | 'trend' | 'map' | 'flags' | 'flag_map';
