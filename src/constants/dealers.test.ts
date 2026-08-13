import type { MaterialLayer } from '@/database/schema/calculations';
import {
  CANADIAN_DEALER_BY_PROVINCE,
  normalizeCanadianProvince,
  resolveCanadianProvinceFromPostalCode,
  resolveDealerContext,
  SHARED_CANADIAN_PRICE_CATALOG_ID,
  type CanadianProvinceCode,
  type DealerId,
} from '@/constants/dealers';
import { getMaterialPriceTotal, priceMaterialLayers } from '@/knowledge/material-pricing';

type LocationFixture = {
  code: CanadianProvinceCode;
  name: string;
  postalCode: string;
  dealerId: DealerId;
  dealerName: 'Modern Arc' | 'Innovative Finishes';
  orderEmail: string;
};

const CANADIAN_LOCATIONS: LocationFixture[] = [
  { code: 'BC', name: 'British Columbia', postalCode: 'V6B 1A1', dealerId: 'innovative-finishes-west', dealerName: 'Innovative Finishes', orderEmail: 'info@semcocanada.ca' },
  { code: 'AB', name: 'Alberta', postalCode: 'T2P 1J9', dealerId: 'innovative-finishes-west', dealerName: 'Innovative Finishes', orderEmail: 'info@semcocanada.ca' },
  { code: 'SK', name: 'Saskatchewan', postalCode: 'S7K 0J5', dealerId: 'innovative-finishes-west', dealerName: 'Innovative Finishes', orderEmail: 'info@semcocanada.ca' },
  { code: 'MB', name: 'Manitoba', postalCode: 'R3C 4T3', dealerId: 'innovative-finishes-west', dealerName: 'Innovative Finishes', orderEmail: 'info@semcocanada.ca' },
  { code: 'YT', name: 'Yukon', postalCode: 'Y1A 2C6', dealerId: 'innovative-finishes-west', dealerName: 'Innovative Finishes', orderEmail: 'info@semcocanada.ca' },
  { code: 'NT', name: 'Northwest Territories', postalCode: 'X1A 2P7', dealerId: 'innovative-finishes-west', dealerName: 'Innovative Finishes', orderEmail: 'info@semcocanada.ca' },
  { code: 'ON', name: 'Ontario', postalCode: 'M5V 2T6', dealerId: 'modern-arc', dealerName: 'Modern Arc', orderEmail: 'order@modernarc.ca' },
  { code: 'QC', name: 'Quebec', postalCode: 'H2Y 1C6', dealerId: 'modern-arc', dealerName: 'Modern Arc', orderEmail: 'order@modernarc.ca' },
  { code: 'NB', name: 'New Brunswick', postalCode: 'E2L 4L5', dealerId: 'modern-arc', dealerName: 'Modern Arc', orderEmail: 'order@modernarc.ca' },
  { code: 'NS', name: 'Nova Scotia', postalCode: 'B3J 2K9', dealerId: 'modern-arc', dealerName: 'Modern Arc', orderEmail: 'order@modernarc.ca' },
  { code: 'PE', name: 'Prince Edward Island', postalCode: 'C1A 4P3', dealerId: 'modern-arc', dealerName: 'Modern Arc', orderEmail: 'order@modernarc.ca' },
  { code: 'NL', name: 'Newfoundland and Labrador', postalCode: 'A1C 5M2', dealerId: 'modern-arc', dealerName: 'Modern Arc', orderEmail: 'order@modernarc.ca' },
  { code: 'NU', name: 'Nunavut', postalCode: 'X0A 0H0', dealerId: 'modern-arc', dealerName: 'Modern Arc', orderEmail: 'order@modernarc.ca' },
];

describe('Canadian dealer routing', () => {
  it.each(CANADIAN_LOCATIONS)(
    'routes $name ($code) to $dealerName from a province name',
    ({ code, name, dealerId, dealerName, orderEmail }) => {
      expect(normalizeCanadianProvince(name)).toBe(code);
      expect(normalizeCanadianProvince(code.toLowerCase())).toBe(code);

      const dealer = resolveDealerContext({ companyProvince: name });
      expect(dealer).toMatchObject({ dealerId, dealerName, orderEmail });
      expect(CANADIAN_DEALER_BY_PROVINCE[code]).toBe(dealerId);
    },
  );

  it.each(CANADIAN_LOCATIONS)(
    'routes $postalCode to $dealerName',
    ({ code, postalCode, dealerId, dealerName, orderEmail }) => {
      expect(resolveCanadianProvinceFromPostalCode(postalCode.toLowerCase())).toBe(code);
      expect(resolveDealerContext({ companyPostalCode: postalCode })).toMatchObject({
        dealerId,
        dealerName,
        orderEmail,
      });
    },
  );

  it('normalizes common punctuation, abbreviations, French names, and full addresses', () => {
    expect(normalizeCanadianProvince('B.C.')).toBe('BC');
    expect(normalizeCanadianProvince('P.E.I.')).toBe('PE');
    expect(normalizeCanadianProvince('N.W.T.')).toBe('NT');
    expect(normalizeCanadianProvince('Québec')).toBe('QC');
    expect(normalizeCanadianProvince('Nouvelle-Écosse')).toBe('NS');
    expect(normalizeCanadianProvince('Île-du-Prince-Édouard')).toBe('PE');
    expect(resolveDealerContext('100 Queen Street, Toronto, ON M5H 2N2').dealerId).toBe('modern-arc');
    expect(resolveDealerContext('Winnipeg, Manitoba').dealerId).toBe('innovative-finishes-west');
  });

  it('splits X-prefix postal codes between Nunavut and Northwest Territories', () => {
    for (const postalCode of ['X0A 0H0', 'X0B 1J0', 'X0C 0G0']) {
      expect(resolveDealerContext(postalCode).dealerId).toBe('modern-arc');
    }
    for (const postalCode of ['X0E 0T0', 'X0G 0A2', 'X1A 2P7']) {
      expect(resolveDealerContext(postalCode).dealerId).toBe('innovative-finishes-west');
    }
  });

  it('uses postal evidence first and the company location before a project fallback', () => {
    expect(resolveDealerContext({
      companyPostalCode: 'R3C 4T3',
      companyProvince: 'Ontario',
    }).dealerId).toBe('innovative-finishes-west');

    expect(resolveDealerContext({
      companyProvince: 'Manitoba',
      projectAddress: 'Toronto, Ontario M5V 2T6',
    }).dealerId).toBe('innovative-finishes-west');

    expect(resolveDealerContext({
      projectAddress: 'Halifax, Nova Scotia B3J 2K9',
    }).dealerId).toBe('modern-arc');
  });

  it('sends an unresolved location to the Semco Canada inbox', () => {
    expect(resolveDealerContext(null)).toMatchObject({
      region: 'unknown',
      dealerId: null,
      dealerName: 'Semco Canada',
      orderEmail: 'info@semcocanada.ca',
    });
    expect(resolveDealerContext('London, England').dealerId).toBeNull();
    expect(resolveCanadianProvinceFromPostalCode('not a postal code')).toBeNull();
  });

  it('uses one nationwide catalog and identical customer prices for both suppliers', () => {
    const layers: MaterialLayer[] = [{
      productId: 'xbond-stone',
      productSku: 'XBOND-STONE',
      productName: 'X-Bond Stone',
      category: 'base',
      coats: 2,
      quantityKg: 45.36,
      quantityPacks: 2,
      packSizeKg: 22.68,
      coverageRateSqmPerKg: 0,
      roundedQuantity: 2,
    }];
    const east = resolveDealerContext({ companyProvince: 'ON' });
    const west = resolveDealerContext({ companyProvince: 'MB' });

    expect(east.priceCatalogId).toBe(SHARED_CANADIAN_PRICE_CATALOG_ID);
    expect(west.priceCatalogId).toBe(east.priceCatalogId);
    expect(west.pricingSourceLabel).toBe(east.pricingSourceLabel);

    const totals = [east, west].map(() => getMaterialPriceTotal(priceMaterialLayers(layers)));
    expect(totals).toEqual([274.72, 274.72]);
  });
});
