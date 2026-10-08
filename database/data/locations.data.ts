export interface LocationData {
  code: string; name: string; city: string; state: string;
  country: string; address: string; timezone: string;
}
export const locationsData: LocationData[] = [
  { code: 'PUNE',  name: 'Pune Corporate Headquarters', city: 'Pune',      state: 'Maharashtra',   country: 'India',
    address: 'Level 7, Cyber Tower, Hinjewadi Phase II, Pune 411057', timezone: 'Asia/Kolkata' },
  { code: 'BLR',   name: 'Bangalore Technology Centre', city: 'Bangalore', state: 'Karnataka',     country: 'India',
    address: 'Tower B, Embassy Tech Village, Outer Ring Road, Bangalore 560103', timezone: 'Asia/Kolkata' },
  { code: 'NOIDA', name: 'Noida Delivery Centre',       city: 'Noida',     state: 'Uttar Pradesh', country: 'India',
    address: 'Plot 21, Sector 62, Noida 201309', timezone: 'Asia/Kolkata' },
];