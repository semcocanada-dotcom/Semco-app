import { resolveDealerContext } from '@/constants/dealers';

describe('dealer routing', () => {
  it('routes Ontario and eastern postal codes to Modern Arc', () => {
    expect(resolveDealerContext({ companyPostalCode: 'M5V 2T6' }).dealerName).toBe('Modern Arc');
    expect(resolveDealerContext({ companyProvince: 'Nova Scotia' }).orderEmail).toBe('order@modernarc.ca');
  });

  it('routes Manitoba and western profiles to Innovative Finishes', () => {
    const westernLocations = [
      { companyPostalCode: 'R3C 4T3' },
      { companyPostalCode: 'S7K 0J5' },
      { companyPostalCode: 'T2P 1J9' },
      { companyPostalCode: 'V6B 1A1' },
      { companyPostalCode: 'X1A 2P7' },
      { companyPostalCode: 'Y1A 2C6' },
      { companyProvince: 'Manitoba' },
      { companyProvince: 'Saskatchewan' },
      { companyProvince: 'Alberta' },
      { companyProvince: 'British Columbia' },
      { companyProvince: 'Yukon' },
      { companyProvince: 'Northwest Territories' },
      { companyProvince: 'Nunavut' },
    ];

    for (const location of westernLocations) {
      const dealer = resolveDealerContext(location);
      expect(dealer.region).toBe('west');
      expect(dealer.dealerName).toBe('Innovative Finishes');
      expect(dealer.orderEmail).toBe('info@semcocanada.ca');
    }
  });

  it('sends unassigned requests to the Semco Canada inbox', () => {
    const incomplete = resolveDealerContext(null);

    expect(incomplete.dealerName).toBe('Semco Canada');
    expect(incomplete.orderEmail).toBe('info@semcocanada.ca');
  });
});
