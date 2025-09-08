import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ISearch, ISearchGridInput, ISearchGridOutput } from '../interfaces/search/search.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { forkJoin, map, take } from 'rxjs';
import { selectOrganizationalUnitByOrganizationCode$, selectOrganizationalUnitBysupervisorUnitCode$ } from 'src/app/shared/state/organizational-units.state';
import { selectRemitByOrganizationalUnitCode$ } from 'src/app/shared/state/remits.state';
import { Organization } from '../interfaces/search/search.interface';
import { IOrganizationUnitList } from '../interfaces/organization-unit';
import { ConstService } from './const.service';
import { LegalProvisionService } from './legal-provision.service';
import { OrganizationNode } from '../interfaces/search/search.interface';
import { ILegalProvision } from '../interfaces/legal-provision/legal-provision.interface';
import { IOrganizationTreeReport } from 'src/app/shared/interfaces/organization/organization-tree-report.interface';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { _countGroupLabelsBeforeOption } from '@angular/material/core';

const APIPREFIX_PSPED = `${environment.elasticUrl}/search/psped`;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  http = inject(HttpClient);
  constService = inject(ConstService);
  legalProvision = inject(LegalProvisionService)

  unitTypes = this.constService.UNIT_TYPES;

  store = inject(Store<AppState>);
  selectOrganizationalUnitByOrganizationCode$ = selectOrganizationalUnitByOrganizationCode$;
  selectOrganizationalUnitBysupervisorUnitCode$ = selectOrganizationalUnitBysupervisorUnitCode$;
  selectRemitByOrganizationalUnitCod$ = selectRemitByOrganizationalUnitCode$;

  postSearch(data: any): Observable<any> {
    return this.http.post<ISearch>(APIPREFIX_PSPED, data);
  };

  showMatrix1(selectedOrganizations: Organization[]) {
    let selectedOrganizationalUnits = []

    for (let data of selectedOrganizations) {
      this.store
        .select(this.selectOrganizationalUnitByOrganizationCode$(data.code))
        .pipe(take(1))
        .subscribe((orgCodes) => {
          selectedOrganizationalUnits = selectedOrganizationalUnits.concat(...orgCodes)

        });
    }

    // Group by unitType and organizationCode
    const result = selectedOrganizationalUnits.reduce((acc, item) => {
      const { unitType, organizationCode } = item;

      const unitTypeDescription = this.unitTypes.find(type => type.id === unitType)?.description || "Unknown Type";

      // Find if this combination already exists in the accumulator
      const existingEntry = acc.find(entry => entry.unitType === unitType && entry.organizationCode === organizationCode);

      if (existingEntry) {
        // If it exists, increment the count
        existingEntry.count += 1;
      } else {
        // If it doesn't exist, create a new entry
        acc.push({
          description: unitTypeDescription,
          unitType: unitType,
          organizationCode: organizationCode,
          count: 1
        });
      }

      return acc;
    }, []);

    return result
  }

  transformMatrixData_1(selectedOrganizations: Organization[]) {
    const observables = selectedOrganizations.map((data) =>
      this.store.select(this.selectOrganizationalUnitByOrganizationCode$(data.code)).pipe(
        take(1),
        map((orgCodes) =>
          orgCodes.map(org => ({ ...org, label: data.preferredLabel }))// Add label
        )
      )
    );

    return forkJoin(observables).pipe(
      map((results) => {
        let selectedOrganizationalUnits = results.flat(); // Flatten array
        // Group by unitType and organizationCode
        return selectedOrganizationalUnits.reduce((acc, item) => {
          const { unitType, organizationCode, label } = item;

          const unitTypeDescription = this.unitTypes.find(type => type.id === +unitType)?.description || "Unknown Type";

          // Find if this combination already exists in the accumulator
          const existingEntry = acc.find(entry => entry.unitType === unitType && entry.organizationCode === organizationCode);

          if (existingEntry) {
            existingEntry.count += 1;
          } else {
            acc.push({
              preferredLabel: label,
              description: unitTypeDescription,
              unitType: unitType,
              organizationCode: organizationCode,
              count: 1
            });
          }

          return acc;
        }, []);
      })
    );
  }

  onExportToExcelMatrix(jsonData: any[]): void {

    // Define headers
    const headers = [
      'Φορέας/Μονάδα',
      'Κωδικός Υπηρεσίας',
      'Γενική Γραμματεία',
      'Ειδική Γραμματεία',
      'Γενική Διεύθυνση',
      'Διεύθυνση',
      'Υποδιεύθυνση',
      'Τμήμα',
      'Γραφείο',
      'Άλλο'
    ];

    // Map descriptions to their respective headers
    const descriptionMap: { [key: string]: string } = {
      "ΓΕΝΙΚΗ ΓΡΑΜΜΑΤΕΙΑ": "ΓΕΝΙΚΗ ΓΡΑΜΜΑΤΕΙΑ",
      "ΕΙΔΙΚΗ ΓΡΑΜΜΑΤΕΙΑ": "ΕΙΔΙΚΗ ΓΡΑΜΜΑΤΕΙΑ",
      "ΓΕΝΙΚΗ ΔΙΕΥΘΥΝΣΗ": "ΓΕΝΙΚΗ ΔΙΕΥΘΥΝΣΗ",
      "ΔΙΕΥΘΥΝΣΗ": "ΔΙΕΥΘΥΝΣΗ",
      "ΥΠΟΔΙΕΥΘΥΝΣΗ": "ΥΠΟΔΙΕΥΘΥΝΣΗ",
      "ΤΜΗΜΑ": "ΤΜΗΜΑ",
      "ΓΡΑΦΕΙΟ": "ΓΡΑΦΕΙΟ",
      "ΑΛΛΟ": "ΑΛΛΟ"
    };

    // Create an empty object to group data by organization
    const groupedData: { [key: string]: any } = {};

    // Process data
    jsonData.forEach(item => {
      const key = item.organizationCode; // Grouping key
      if (!groupedData[key]) {
        groupedData[key] = {
          'Φορέας/Μονάδα': item.preferredLabel,
          'Κωδικός Υπηρεσίας': item.organizationCode,
          'ΓΕΝΙΚΗ ΓΡΑΜΜΑΤΕΙΑ': 0,
          'ΕΙΔΙΚΗ ΓΡΑΜΜΑΤΕΙΑ': 0,
          'ΓΕΝΙΚΗ ΔΙΕΥΘΥΝΣΗ': 0,
          'ΔΙΕΥΘΥΝΣΗ': 0,
          'ΥΠΟΔΙΕΥΘΥΝΣΗ': 0,
          'ΤΜΗΜΑ': 0,
          'ΓΡΑΦΕΙΟ': 0,
          'ΑΛΛΟ': 0
        };
      }

      // Match the description field with the corresponding header
      for (const [header, description] of Object.entries(descriptionMap)) {
        if (item.description === header) {
          groupedData[key][header] = item.count;
        }
      }
    });


    // Convert grouped data into an array for Excel
    const excelData = Object.values(groupedData);

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Συγκριτικός Πίνακας Φορέων');

    // Write workbook and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `matrix1.xlsx`);
  }

  transformMatrixData_2(selectedOrganizations: IOrganizationUnitList[]) {
    let selectedOrganizationalUnits = []

    for (let data of selectedOrganizations) {
      this.findChildren(data.code, data.code, data.preferredLabel, selectedOrganizationalUnits)
    }

    // Group by unitType and organizationCode
    const result = selectedOrganizationalUnits.reduce((acc, item) => {
      const { unitType, fatherCode, fatherLabel } = item;

      const unitTypeDescription = this.unitTypes.find(type => type.id === unitType)?.description || "Unknown Type";

      // Find if this combination already exists in the accumulator
      const existingEntry = acc.find(entry => entry.unitType === unitType && entry.organizationCode === fatherCode);
      if (existingEntry) {
        // If it exists, increment the count
        existingEntry.count += 1;
      } else {
        // If it doesn't exist, create a new entry
        acc.push({
          description: unitTypeDescription,
          unitType: unitType,
          organizationCode: fatherCode,
          preferredLabel: fatherLabel,
          count: 1
        });
      }

      return acc;
    }, []);

    return result
  }

  findChildren(code: string, fatherCode: string, fatherLabel: string, selectedOrganizationalUnits: any[]) {

    this.store
      .select(this.selectOrganizationalUnitBysupervisorUnitCode$(code))
      .pipe(take(1))
      .subscribe((orgCodes) => {
        orgCodes.filter(doc => doc.supervisorUnitCode === code)
          .forEach(childDoc => {
            // Add the current document with necessary fields to the result
            selectedOrganizationalUnits.push({
              fatherCode: fatherCode,
              fatherLabel: fatherLabel,
              unitType: childDoc.unitType,
              code: childDoc.code,
              preferredLabel: childDoc.preferredLabel
            });

            // Recursively find children of the current document
            this.findChildren(childDoc.code, fatherCode, fatherLabel, selectedOrganizationalUnits);
          });
      });

    return selectedOrganizationalUnits
  }

  transformMatrixData_3(rowsSelected: any, filteredRows: any) {
    let selectedRemits = []

    // console.log(rowsSelected, filteredRows)

    if (filteredRows.length === 0) {
      for (let data of rowsSelected) {
        this.store
          .select(this.selectRemitByOrganizationalUnitCod$(data.organizationalUnitCode))
          .pipe(take(1))
          .subscribe((orgCodes) => {
            selectedRemits = selectedRemits.concat(...orgCodes)

          });
      }
    } else {
      for (let data of rowsSelected) {
        let remits = []
        // console.log("Service>>",rowsSelected,filteredRows)
        remits = filteredRows.filter(doc => doc.organizationalUnitCode === data.organizationalUnitCode)
        selectedRemits = selectedRemits.concat(...remits)
      }
      // console.log(selectedRemits)
    }
    return selectedRemits
  }

  createGridData(data: ISearchGridInput): ISearchGridOutput[] {
    const result: ISearchGridOutput[] = [];
    console.log(">>>",data);
    data.organizations.forEach(org => {
      console.log(org);
      const orgCode = org.code;
      const orgScore = org.score;
      const orgObjectId = org.object_id;
      const orgPreferredLabel = org.preferredLabel;

      if (!org["organizational_units"]) {
        // If organizational_units is empty
        result.push({
          organizationCode: orgCode,
          organizationScore: orgScore,
          organizationObjectId: orgObjectId,
          organizationPreferredLabel: orgPreferredLabel,
          organizationalUnitCode: "",
          organizationalUnitScore: 0,
          organizationalUnitObjectId: "",
          organizationalUnitPreferredLabel: "--",
          remitText: "--",
          remitObjectId: "",
          remitScore: 0
        });
      } else {
        // Loop through organizational_units
        org.organizational_units.forEach(unit => {
          const unitCode = unit.code;
          const unitScore = unit.score;
          const unitObjectId = unit.object_id;
          const unitPreferredLabel = unit.preferredLabel;

          if (!unit["remits"]) {
            // If remits is empty
            result.push({
              organizationCode: orgCode,
              organizationScore: orgScore,
              organizationObjectId: orgObjectId,
              organizationPreferredLabel: orgPreferredLabel,
              organizationalUnitCode: unitCode,
              organizationalUnitScore: unitScore,
              organizationalUnitObjectId: unitObjectId,
              organizationalUnitPreferredLabel: unitPreferredLabel,
              remitText: "--",
              remitObjectId: "",
              remitScore: 0
            });
          } else {
            // Loop through remits
            unit.remits.forEach(remit => {
              result.push({
                organizationCode: orgCode,
                organizationScore: orgScore,
                organizationObjectId: orgObjectId,
                organizationPreferredLabel: orgPreferredLabel,
                organizationalUnitCode: unitCode,
                organizationalUnitScore: unitScore,
                organizationalUnitObjectId: unitObjectId,
                organizationalUnitPreferredLabel: unitPreferredLabel,
                remitText: remit.remitText,
                remitObjectId: remit.object_id,
                remitScore: remit.score
              });

            });
          }
        });
      }
    });
    return result;
  }

  onExportCSV(data: any[]) {
    // Define the CSV headers
    // const headers = ['Φορέας', 'Μονάδα', 'Αρμοδιότητα', 'Τύπος', 'ΦΕΚ', 'Στοιχεία', 'ΑΔΑ'];
    const headers = ['Φορέας', 'Μονάδα', 'Αρμοδιότητα', 'ΦΕΚ', 'Στοιχεία', 'ΑΔΑ'];
    const separator = ','; // CSV separator

    // Construct CSV content
    const csvContent = [
      headers.join(separator), // Add the headers
      ...data.flatMap((item) =>
        item.legalProvisionDetails.map((detail) => {
          const row = [
            `"${item.organizationPreferredLabel}"`, // Φορέας
            `"${item.organizationalUnitPreferredLabel}"`, // Μονάδα
            `"${item.remitText.replace(/[\r\n]+/g, ' ').replace(/"/g, '""')}"`, // Αρμοδιότητα (cleaned text)
            // `"${item.remitType}"`, // Τύπος
            `"${detail.legalActKey}"`, // ΦΕΚ
            `"${JSON.stringify(detail.legalProvisionSpecs).replace(/"/g, '""')}"`, // Στοιχεία (as JSON string)
            `"${detail.ada}"` // ΑΔΑ
          ];
          return row.join(separator); // Join row data with the separator
        })
      )
    ].join('\n');

    // Create a Blob for the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the URL to free memory
    URL.revokeObjectURL(url);
  }

  onExportToExcel(jsonData: any[]): void {
    // Define headers
    const headers = ['Φορέας', 'Μονάδα', 'Αρμοδιότητα', 'ΦΕΚ', 'Στοιχεία', 'ΑΔΑ'];

    // Flatten the data
    const flattenedData = jsonData.flatMap(item =>
      item.legalProvisionDetails.map(detail => ({
        Φορέας: item.organizationPreferredLabel,
        Μονάδα: item.organizationalUnitPreferredLabel,
        Αρμοδιότητα: item.remitText.replace(/<\/?[^>]+(>|$)/g, ''), // Remove HTML tags
        ΦΕΚ: detail.legalActKey,
        Στοιχεία: [
          detail.legalProvisionSpecs.meros,
          detail.legalProvisionSpecs.arthro,
          detail.legalProvisionSpecs.paragrafos,
          detail.legalProvisionSpecs.edafio,
          detail.legalProvisionSpecs.pararthma,
        ]
          .filter(part => part) // Remove empty fields
          .join(', '), // Concatenate specs
        ΑΔΑ: detail.ada,
      }))
    );

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(flattenedData, { header: headers });

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data');

    // Write workbook and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `export.xlsx`);
  }

  onExportToExcel_OrganizationChart(hierarchicalData: OrganizationNode[]) {
    const flattenedData: any[] = [];
    this.flattenTree(hierarchicalData, '', flattenedData);

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flattenedData);

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Οργανόγραμμα');

    // Save file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'OrganizationTree.xlsx');
  }

  flattenTree(nodes: OrganizationNode[], prefix: string, result: any[]) {
    nodes.forEach((node, index) => {
      const currentPrefix = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;

      result.push({
        'Ιεραρχία': currentPrefix,
        'Μονάδα': node.monada.preferredLabel,
        'Κωδικός Μονάδας': node.monada.code,
        'Επίπεδο': node.level,
        'Επεκτάσιμο': node.expandable ? 'Ναι' : 'Όχι',
        "Κατάσταση Αρμοδιοτήτων": node.remitsFinalized ? 'Ολοκληρωμένες' : 'Σε Επεξεργασία',
      });

      if (node.children && node.children.length > 0) {
        this.flattenTree(node.children, currentPrefix, result);
      }
    });
  }

  onExportToExcel_LegalProvisions(organizations: ILegalProvision[], organizationalUnits: IOrganizationTreeReport[], organizationName: string, organizationCode: string) {
    const data: any[] = [];

    // Add organizations legal provisions data
    organizations.forEach(item => {
      data.push({
        'Μονάδα': organizationName,
        'Κωδικός Μονάδας': organizationCode,
        'Διάταξη Πρόβλεψης': item.legalActKey,
        'Μέρος': item.legalProvisionSpecs.meros,
        'Κεφάλαιο': item.legalProvisionSpecs.kefalaio,
        'Άρθρο': item.legalProvisionSpecs.arthro,
        'Παράγραφος': item.legalProvisionSpecs.paragrafos,
        'Εδάφιο': item.legalProvisionSpecs.edafio,
        'Παράρτημα': item.legalProvisionSpecs.pararthma,
        'Κείμενο': item.legalProvisionText
      });
    });

    // Add organization units legal provisions data
    organizationalUnits.forEach(node => {
      node.provisions.forEach(provision => {
        data.push({
          'Μονάδα': node.monada.preferredLabel,
          'Κωδικός Μονάδας': node.monada.code,
          'Διάταξη Πρόβλεψης': provision.legalActKey,
          'Μέρος': provision.legalProvisionSpecs.meros,
          'Κεφάλαιο': provision.legalProvisionSpecs.kefalaio,
          'Άρθρο': provision.legalProvisionSpecs.arthro,
          'Παράγραφος': provision.legalProvisionSpecs.paragrafos,
          'Εδάφιο': provision.legalProvisionSpecs.edafio,
          'Παράρτημα': provision.legalProvisionSpecs.pararthma,
          'Κείμενο': provision.legalProvisionText
        });
      });
    });

    // Create a new worksheet and workbook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Διατάξεις Πρόβλεψεις');

    // Save the file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'LegalProvisions.xlsx');
  }

  onExportToExcel_Remits(organizationalUnits: IOrganizationTreeReport[]) {
    const data: any[] = [];

    // Add organization units legal provisions data
    organizationalUnits.forEach(node => {
      node.remits.forEach(remit => {
        remit.legalProvisions.forEach(provision => {
          data.push({
            'Μονάδα': node.monada.preferredLabel,
            'Κωδικός Μονάδας': node.monada.code,
            'Αρμοδιότητα': remit.remitText,
            'Διάταξη Πρόβλεψης': provision.legalActKey,
            'Μέρος': provision.legalProvisionSpecs.meros,
            'Κεφάλαιο': provision.legalProvisionSpecs.kefalaio,
            'Άρθρο': provision.legalProvisionSpecs.arthro,
            'Παράγραφος': provision.legalProvisionSpecs.paragrafos,
            'Εδάφιο': provision.legalProvisionSpecs.edafio,
            'Παράρτημα': provision.legalProvisionSpecs.pararthma,
            'Κείμενο': provision.legalProvisionText,
            "Κατάσταση Αρμοδιοτήτων": node.remitsFinalized ? 'Ολοκληρωμένες' : 'Σε Επεξεργασία',
          });
        })
      });
    });

    // Create a new worksheet and workbook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Αρμοδιότητες');

    // Save the file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Remits.xlsx');
  }
}
