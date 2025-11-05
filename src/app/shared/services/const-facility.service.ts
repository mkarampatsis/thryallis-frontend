import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import {
  ColDef,
  RowClassRules,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy
} from 'ag-grid-community';
import { UserService } from './user.service';
import { isNgTemplate } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ConstFacilityService {
  userService = inject(UserService)

  readonly USE_OF_FACILITY = [
    "Κτίριο Γραφείων (Υπηρεσίες)",
    "Εκπαιδευτική Μονάδα",
    "Νοσηλευτική Μονάδα",
    "Κατασκευαστική Μονάδα/Εργοστάσιο",
    "Αποθήκη/χώρος logistics",
    "Parking",
    "Αθλητική Εγκατάσταση",
    "Συνεδριακή/Εκθεσιακή Εγκατάσταση",
    "Πυροσβεστικός Σταθμός",
    "Σωφρονιστικό Κατάστημα",
    "Εκκλησία",
    "Νεκροταφείο",
    "Αερολιμένας",
    "Λιμένας",
    "Αιγιαλός",
    "Οικόπεδο (χωρίς ειδικότερη χρήση)",
    "Άλλη Χρήση"
  ]

  readonly FLOORPLANS = [
    "Όροφος",
    "Ισόγειο",
    "Υπόγειο",
    "Ημιυπόγειο",
    "Ημιόροφος",
    "Ταράτσα"
  ]

  readonly SPACE_USE = [
    {
      "type": "Κτίριο Γραφείων (Υπηρεσίες)",
      "spaces": [
        "Χώρος γραφείων",
        "Χώρος υποδοχής/αναμονής",
        "Αίθουσα συσκέψεων",
        "Χώρος εκπαίδευσης",
        "Αμφιθέατρο",
        "Βιβλιοθήκη",
        "Χώρος υπολογιστικών συστημάτων (server, κτλ.)",
        "Άλλο"
      ]
    },
    {
      "type": "Εκπαιδευτική Μονάδα",
      "spaces": [
        "Αίθουσα διδασκαλίας",
        "Εργαστήριο",
        "Αμφιθέατρο",
        "Βιβλιοθήκη",
        "Γυμναστήριο (κλειστό)",
        "Γήπεδο - Χώρος αθλοπαιδιών",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Αίθουσα συσκέψεων",
        "Χώρος δραστηριότητας νηπίων",
        "Χώρος ύπνου νηπίων",
        "Άλλο",
      ]
    },
    {
      "type": "Νοσηλευτική Μονάδα",
      "spaces": [
        "Θάλαμος νοσηλείας",
        "Χειρουργείο",
        "Μονάδα Αυξημένης Φροντίδας (ΜΑΦ)",
        "Μονάδα Εντατικής Θεραπείας (ΜΕΘ)",
        "Τμήμα Επειγόντων Περιστατικών (ΤΕΠ)",
        "Εξωτερικά Ιατρεία",
        "Εργαστήριο",
        "Ειδικά θωρακισμένος χώρος (Χ-Ray, CT, MRI, Pet Scan, ραδιοϊσότοπα, κτλ.)",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Αμφιθέατρο",
        "Αίθουσα συσκέψεων",
        "Βιβλιοθήκη",
        "Χώρος υπολογιστικών συστημάτων (server, κτλ.)",
        "Αίθουσα αποστείρωσης",
        "Χώρος πλυντηρίων",
        "Ιματιοθήκη",
        "Χώρος προσωρινής αποθήκευσης νοσοκ. απορριμάτων",
        "Εκκλησία",
        "Άλλο",
      ]
    },
    {
      "type": "Κατασκευαστική Μονάδα/Εργοστάσιο",
      "spaces": [
        "Χώρος παραγωγής",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Αίθουσα συσκέψεων",
        "Χώρος εκπαίδευσης",
        "Χώρος υπολογιστικών συστημάτων (server, κτλ.)",
        "Άλλο",
      ]
    },
    {
      "type": "Αποθήκη/χώρος logistics",
      "spaces": [
        "Χώρος αποθήκευσης",
        "Χώρος ψύξης/κατάψυξης",
        "Χώρος συσκευασίας",
        "Χώρος υποδοχής",
        "Χώρος προετοιμασίας αγαθών",
        "Χώρος αποστολής",
        "Χώρος φόρτωσης/εκφόρτωσης",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Αίθουσα συσκέψεων",
        "Άλλο",
      ]
    },
    {
      "type": "Parking",
      "spaces": [
        "Θέση στάθμευσης κανονικού οχήματος",
        "Θέση στάθμευσης δίκυκλου",
        "Θέση στάθμευσης μεγάλου οχήματος (φορτηγού ή άλλου)",
        "Είσοδος/έξοδος οχημάτων",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Άλλο",
      ]
    },
    {
      "type": "Αθλητική Εγκατάσταση",
      "spaces": [
        "Γήπεδο – Ανοικτός Χώρος Άθλησης",
        "Κλειστό Γυμναστήριο",
        "Χώρος βοηθητικής εκγύμνασης (π.χ. για βάρη)",
        "Χώρος πισίνας",
        "Κερκίδες",
        "Χώρος δημοσιογράφων/σχολιαστών",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Αίθουσα συσκέψεων",
        "Άλλο",
      ]
    },
    {
      "type": "Συνεδριακή/Εκθεσιακή Εγκατάσταση",
      "spaces": [
        "Εκθεσιακός χώρος",
        "Συνεδριακός χώρος",
        "Αμφιθέατρο",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Αίθουσα συσκέψεων",
        "Χώρος υπολογιστικών συστημάτων (server, κτλ.)",
        "Άλλο",
      ]
    },
    {
      "type": "Πυροσβεστικός Σταθμός",
      "spaces": [
        "Γκαράζ οχημάτων (Αμαξοστάσιο)",
        "Κέντρο διαχείρισης, ελέγχου και επικοινωνιών",
        "Χώρος συντήρησης και επισκευών",
        "Χώρος εκπαίδευσης πυροσβεστών",
        "Εξωτερικός χώρος εκπαίδευσης/ασκήσεων",
        "Αποθήκη εξοπλισμού, στολών, κτλ.",
        "Χώρος ξεκούρασης (Θάλαμοι πυροσβεστών)",
        "Χώρος γραφείων (υπηρεσίες)",
        "Αίθουσα συσκέψεων",
        "Άλλο",
      ]
    },
    {
      "type": "Σωφρονιστικό Κατάστημα",
      "spaces": [
        "Χώρος κελιών",
        "Χώρος επισκεπτηρίου",
        "Χώρος απομόνωσης",
        "Χώρος ελέγχου εισόδου",
        "Εσωτερική ζώνη/περίμετρος ασφάλειας",
        "Χώρος πλυντηρίων",
        "Βιβλιοθήκη",
        "Χώρος γραφείων (υπηρεσίες)",
        "Χώρος υποδοχής/αναμονής",
        "Αίθουσα συσκέψεων",
        "Άλλο",
      ]
    },
    {
      "type": "Εκκλησία",
      "spaces": [
        "Ιερός Ναός",
        "Χώρος γραφείων",
        "Αίθουσα εκδηλώσεων",
        "Βιβλιοθήκη",
        "Άλλο",
      ]
    },
    {
      "type": "Νεκροταφείο",
      "spaces": [
        "Χώρος ταφής",
        "Εκκλησία",
        "Καφετέρια/αναψυκτήριο",
        "Χώρος γραφείων (υπηρεσίες)",
        "Άλλο",
      ]
    },
    {
      "type": "Αερολιμένας",
      "spaces": [
        {
          "type": "Αεροσταθμός",
          "spaces": [
            "Χώρος αναχωρήσεων (check-in και λοιποί χώροι)",
            "Χώρος ελέγχου αναχωρούντων επιβατών",
            "Χώρος καταστημάτων",
            "Πύλη επιβίβασης (Gates)",
            "Χώρος διακίνησης αποσκευών",
            "Χώρος παραλαβής αποσκευών",
            "Τελωνειακός έλεγχος",
            "Χώρος απωλεσθέντων",
            "Χώρος αναμονής αφίξεων",
            "Χώρος γραφείων (υπηρεσίες)",
            "Αίθουσα συσκέψεων",
            "Χώρος εκπαίδευσης",
            "Χώρος υπολογιστικών συστημάτων (server, κτλ.)",
            "Άλλο",
          ]
        },
        {
          "type": "Πύργος Ελέγχου και συναφή κτίρια",
          "spaces": [
            "Αίθουσα ΕΕΚ (Ελέγχου Εναέριας Κυκλοφορίας)",
            "Κ/Τ Κέντρο Τηλεπικοινωνιών",
            "Χώρος Ηλεκτρονικών",
            "Χώρος Ηλεκτρολόγων",
            "Χώρος Ψυκτικών",
            "Χώρος γραφείων (υπηρεσίες)",
            "Αίθουσα συσκέψεων",
            "Χώρος εκπαίδευσης",
            "Χώρος υπολογιστικών συστημάτων (server, κτλ.)",
            "Άλλο",
          ]
        },
        {
          "type": "Τεχνική Βάση και συναφή κτίρια",
          "spaces": [
            "Υπόστεγο συντήρησης",
            "Αποθηκευτικός χώρος εξοπλισμού - ανταλλακτικών κτλ.",
            "Χώρος γραφείων (υπηρεσίες)",
            "Άλλο"
          ]
        },
        {
          "type": "Εμπορευματικός σταθμός – Cargo και συναφή κτίρια",
          "spaces": [
            "Χώρος παραλαβής/διαλογής εμπορευμάτων",
            "Χώρος σάρωσης/ελέγχου ασφαλείας",
            "Χώρος προσωρινής φύλαξης",
            "Χώρος αποθήκευσης",
            "Χώρος ψύξης/κατάψυξης",
            "Χώρος τελωνείου",
            "Χώρος υποδοχής",
            "Χώρος προετοιμασίας αγαθών",
            "Χώρος αποστολής",
            "Χώρος φόρτωσης/εκφόρτωσης",
            "Χώρος γραφείων (υπηρεσίες)",
            "Χώρος υποδοχής/αναμονής",
            "Αίθουσα συσκέψεων",
            "Άλλο",
          ]
        },
        {
          "type": "Πυροσβεστικός σταθμός",
          "spaces": [
            "Γκαράζ οχημάτων (Αμαξοστάσιο)",
            "Κέντρο διαχείρισης, ελέγχου και επικοινωνιών",
            "Χώρος συντήρησης και επισκευών",
            "Χώρος εκπαίδευσης πυροσβεστών",
            "Εξωτερικός χώρος εκπαίδευσης/ασκήσεων",
            "Αποθήκη εξοπλισμού, στολών, κτλ.",
            "Χώρος ξεκούρασης (Θάλαμοι πυροσβεστών)",
            "Χώρος γραφείων (υπηρεσίες)",
            "Αίθουσα συσκέψεων",
            "Άλλο",
          ]
        },
        {
          "type": "Πεδίο ελιγμών",
          "spaces": [
            "Διάδρομος αεροσκαφών",
            "Τροχόδρομος",
            "Δάπεδο αεροσκαφών",
            "Βοηθητική οδός",
            "Λοιποί χώροι πεδίου ελιγμών",
          ]
        },
        {
          "type": "Άλλη Εγκατάσταση Αερολιμένα",
          "spaces": [
            "Άλλο"
          ]
        }
      ]
    },
    {
      "type": "Λιμένας",
      "spaces": [
        {
          "type": "Ζώνη υποδοχής/ελλιμενισμού πλοίων",
          "spaces": [
            "Προβλήτα (Ντόκος)",
            "Πλωτές εξέδρα",
            "Λεκάνη ελιγμών (Turning Basin)",
            "Άλλο"
          ]
        },
        {
          "type": "Ζώνη Φόρτωσης, Εκφόρτωσης και Αποθήκευσης",
          "spaces": [
            "Τερματικοί σταθμοί εμπορευματοκιβωτίων (Container Terminals)",
            "Χώροι αποθήκευσης ξηρού φορτίου",
            "Χώροι αποθήκευσης υγρών καυσίμων, χημικών και υγρών.",
            "Εγκαταστάσεις ψυγείων (Reefer Areas)",
            "Σιλό αποθήκευσης χύδην φορτίων",
            "Ζώνες στάθμευσης εμπορευμάτων (Marshalling Yards)",
            "Άλλο"
          ]
        },
        {
          "type": "Επιβατικός Σταθμός",
          "spaces": [
            "Αίθουσες αναμονής επιβατών",
            "Check-in και τελωνειακός έλεγχος",
            "Γραφεία ναυτιλιακών/ταξιδιωτικών εταιρειών",
            "Χώροι αποσκευών και απολεσθέντων αντικειμένων ",
            "Ζώνες φόρτωσης οχημάτων (Ro-Ro Terminals)",
            "Χώρος γραφείων (υπηρεσίες)",
            "Άλλο"
          ]
        },
        {
          "type": "Χώροι συγκοινωνιών και δικτύων μεταφορών λιμένα",
          "spaces": [
            "Χώροι Οδικού δικτύου ",
            "Χώροι σιδηροδρομικού δικτύου",
            "Περιοχή φορτοεκφόρτωσης φορτηγών (Truck Terminals)",
            "Σταθμός μεταφόρτωσης (Intermodal Terminal)",
            "Χώρος αποβλήτων και ανακύκλωσης",
            "Άλλο"
          ]
        },
        {
          "type": "Διοίκηση και Λοιπές Εγκαταστάσεις",
          "spaces": [
            "Λιμενικός σταθμός",
            "Σταθμός ρυμουλκών (Tugboat Station).",
            "Χώροι Τελωνείου και συνοριακού ελέγχου",
            "Κέντρο ελέγχου κυκλοφορίας πλοίων (Vessel Traffic Service – VTS).",
            "Χώρος γραφείων (υπηρεσίες)",
            "Χώρος υποδοχής/αναμονής",
            "Αίθουσα συσκέψεων",
            "Άλλο"
          ]
        },
        {
          "type": "Ναυπηγοεπισκευαστικές Εγκαταστάσεις",
          "spaces": [
            "Δεξαμενή ξηράς (Dry Dock)",
            "Εργαστήριο",
            "Αποθήκη ανταλλακτικών",
            "Χώρος αποθήκευσης υλικών ναυπήγησης",
            "Χώρος γραφείων (υπηρεσίες)",
            "Άλλο"
          ]
        },
        {
          "type": "Άλλη Εγκατάσταση Λιμένα",
          "spaces": [
            "Άλλο"
          ]
        }
      ]
    },
    {
      "type": "Αιγιαλός",
      "spaces": [
        "Αιγιαλός",
        "Άλλο"
      ]
    },
    {
      "type": "Οικόπεδο (χωρίς ειδικότερη χρήση)",
      "spaces": [
        "Αδόμητο οικόπεδο",
        "Άλλο"
      ]
    },
    {
      "type": "Άλλη Χρήση",
      "spaces": [
        "Άλλο"
      ]
    }
  ]

  readonly AUXILIARY_SPACES = [
    "Κεντρική Είσοδος",
    "Διάδρομος",
    "Τουαλέτα",
    "Χώρος ντους",
    "Αποδυτήρια",
    "Κουζίνα",
    "Τραπεζαρία",
    "Κλίμακα",
    "Αποθήκη",
    "Ιατρείο",
    "Αναρρωτήριο",
    "Φρεάτιο Ανελκυστήρα",
    "Μηχανισμός Ανελκυστήρα",
    "Χώρος Ηλεκτροπαραγωγών Ζευγών (Η/Ζ, Γεννητριών)",
    "Θέση Στάθμευσης Στεγασμένη",
    "Θέση Στάθμευσης Ανοιχτή",
    "Είσοδος/έξοδος οχημάτων - ράμπα",
    "Κυλικείο-Εντευκτήριο",
    "Προαύλιο",
    "Κήπος",
    "Αίθριο",
    "Ταράτσα",
    "Βεράντα/εξώστης",
    "Άλλος βοηθητικός χώρος"
  ]

  // AgGrid related constants
  defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    floatingFilter: true,
    wrapText: true, // Wrap Text
    autoHeight: true,
    wrapHeaderText: true, // Wrap Header Text
    autoHeaderHeight: true,
  };

  autoSizeStrategy:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy = { type: 'fitCellContents' };

    FACILTY_COL_DEFS: ColDef[] = [
    { 
      field: 'addressOfFacility', 
      headerName: 'Ακίνητο', 
      cellRenderer: (params) => {
        let item = '';
        const data = params.value;
        item = data.street + ',' + data.number + ',' + data.number + ',' + data.postcode + ',' + data.area + ',' + data.municipality;
        return item;
      },
      flex: 1 
    },
    { field: 'distinctiveNameOfFacility', headerName: 'Διακριτή ονομασία', flex: 1 },
    { field: 'useOfFacility', headerName: 'Τύπος Χρήσης', flex: 1 },
    { field: 'kaek', headerName: 'ΚΑΕΚ', flex: 1 },
    { field: 'organization', headerName: 'Φορέας', flex: 1 },
    {
      field: 'actionCell',
      headerName: 'Ενέργειες Ακινήτου',
      cellRenderer: (params) => {
        if (this.userService.hasFacilityEditorRoleInOrganization(params.data.organizationCode)) {
          return `
            <i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="info_facility" title="Εμφάνιση ακινήτου" role="button"></i>
            <i class="bi bi-pencil text-success fs-6 action-icon" data-action="edit_facility" title="Επεξεργασία ακινήτου" role="button"></i>
            <i class="bi bi-file-x text-danger fs-6 action-icon" data-action="delete_facility" title="Διαγραφή ακινήτου" role="button"></i>
          `;
        } else {
          return `<i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="info_facility" title="Εμφάνιση ακινήτου" role="button"></i>`
        }
      },
      filter: false,
      sortable: false,
      floatingFilter: false,
      resizable: false,
      flex: 0.7,
    },
    {
      field: 'actionCell',
      headerName: 'Ενέργειες Χώρων',
      cellRenderer: (params) => {
        if (this.userService.hasFacilityEditorRoleInOrganization(params.data.organizationCode)) {
          return `
            <i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="info_spaces" title="Εμφάνιση χώρων" role="button"></i>
            <i class="bi bi-building-add me-2 text-primary fs-6 action-icon" data-action="add_space" role="button" title="Εισαγωγή χώρου"></i>
          `;
        } else {
          return `<i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="info_spaces" title="Εμφάνιση χώρων" role="button"></i>`
        }
      },
      filter: false,
      sortable: false,
      floatingFilter: false,
      resizable: false,
      flex: 0.7,
    }    
  ];

  SPACE_COL_DEFS: ColDef[] = [
    { field: 'spaceName', headerName: 'Ονομασία Χώρου', flex: 1 },
    { field: 'spaceUse.type', headerName: 'Τύπος Χρήσης', flex: 1 },
    { field: 'spaceUse.space', headerName: 'Χρήση', flex: 1 },
    { field: 'spaceArea', headerName: 'Εμβαδόν', flex: 0.5 },
    { field: 'spaceLength', headerName: 'Μήκος', flex: 0.5 },
    { field: 'spaceWidth', headerName: 'Πλάτος', flex: 0.5 },
    { field: 'floorPlans.level', headerName: 'Όροφος', flex: 0.5 },
    { field: 'floorPlans.num', headerName: 'Επίπεδο', flex: 0.5 },
    {
      field: 'actionCell',
      headerName: 'Ενέργειες',
      cellRenderer: (params) => {
        if (this.userService.hasFacilityEditorRoleInOrganization(params.data.facilityId.organizationCode)) {
          return `
            <i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="showSpace" title="Εμφάνιση χώρου" role="button"></i>
            <i class="bi bi-pencil text-success fs-6 action-icon" data-action="editSpace" title="Επεξεργασία χώρου" role="button"></i>
            <i class="bi bi-file-x text-danger fs-6 action-icon" data-action="deleteSpace" title="Διαγραφή χώρου" role="button"></i>
          `;
        } else {
          return `<i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="showSpace" title="Εμφάνιση χώρου" role="button"></i>`
        }
      },
      filter: false,
      sortable: false,
      floatingFilter: false,
      resizable: false,
      flex: 0.5,
    }    
  ];

  SPACE_EQUIPMENT_COL_DEFS: ColDef[] = [
    { headerName: 'Επιλογή', headerCheckboxSelection: false, checkboxSelection: true, filter: false, flex: 0.5 },
    { 
      field: 'organizationalUnit', 
      headerName: 'Μονάδα', 
      valueGetter: (params) => {
        if (!params.data.spaces) return '';
        return params.data.spaces.organizationalUnit.map(s => s.organizationalUnit).join(', ');
      },
      // cellRenderer: (params) => {
      //   const label = params.data.spaces.organizationalUnit.map(item => item.organizationalUnit) 
      //   return label.join(', ');
      // },  
      filter: true,
      flex: 1 
    },
    { field: 'spaces.spaceName', headerName: 'Ονομασία χώρου', flex: 1 },
    { field: 'spaces.spaceUse.space', headerName: 'Χρήση χώρου', flex: 1 },
    { field: 'distinctiveNameOfFacility', headerName: 'Διακριτή ονομασία ακινήτου', flex: 1 },
    { field: 'spaces.spaceUse.type', headerName: 'Τύπος χρήσης ακινήτου', flex: 1 },
   
  ];

  EQUIPMENT_COL_DEFS: ColDef[] = [
    {
      field: 'spaces',
      headerName: 'Χώρος',
      valueGetter: (params) => {
        if (!params.data.spaces) return '';
        return params.data.spaces.map(s => s.spaceName).join(', ');
      },
      filter: true,
      flex:1
    },
    {
      field: 'itemQuantity',
      headerName: 'Κωδικοί',
      valueGetter: (params) => {
        if (!params.data.itemQuantity) return '';
        return params.data.itemQuantity.map(s => s.codes).join(', ');
      },
      filter: true,
      flex:1
    },
    { field: 'resourceSubcategory', headerName: 'Υποκατηγορία', flex: 1 },
    { field: 'kind', headerName: 'Είδος', flex: 1 },
    { field: 'type', headerName: 'Τύπος', flex: 1 },
    { 
      field: 'itemDescription', 
      headerName: 'Τιμές',
      valueGetter: (params) => {
        if (!params.data.itemDescription) return '';
        return params.data.itemDescription.map(s => s.description + '=' + s.value).join(', ');
      },
      flex: 1,
      filter: true, 
    },
    {
      field: 'actionCell',
      headerName: 'Ενέργειες',
      cellRenderer: (params) => {
        if (this.userService.hasFacilityEditorRoleInOrganization(params.data.organizationCode)) {
          return `
            <i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="showEquipment" title="Εμφάνιση εξοπλισμού" role="button"></i>
            <i class="bi bi-pencil text-success fs-6 action-icon" data-action="editEquipment" title="Επεξεργασία εξοπλισμού" role="button"></i>
            <i class="bi bi-file-x text-danger fs-6 action-icon" data-action="deleteEquipment" title="Διαγραφή εξοπλισμού" role="button"></i>
          `;
        } else {
          return `<i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="showEquipment" title="Εμφάνιση εξοπλισμού" role="button"></i>`
        } 
      },
      filter: false, 
      flex:0.5
    }
  ];

  EMPLOYEE_COL_DEFS: ColDef[] = [
    {
      field: 'organizationalUnit',
      headerName: 'Μονάδα',
      filter: true,
      flex:1
    },
    { field: 'firstname', headerName: 'Όνομα', filter: true, flex: 1 },
    { field: 'lastname', headerName: 'Επίθετο', filter: true, flex: 1 },
    { 
      field: 'dateAppointment', 
      headerName: 'Ημερομηνία διορισμού', 
      valueFormatter: (params) => {
        const raw = params.value;
        if (raw && raw.$date) {
          return new Date(raw.$date).toLocaleDateString('el-GR');
        }
        return '';
      },
      filter: true, 
      flex: 1 
    },
    { field: 'workStatus', headerName: 'Σχέση Εργασίας', filter: true, flex: 1 },
    { field: 'workCategory', headerName: 'Κατηγορία', filter: true, flex: 1 },
    { field: 'workCategory', headerName: 'Κατηγορία', filter: true, flex: 1 },
    { field: 'workSector', headerName: 'Κλάδος – ειδικότητα', filter: true, flex: 1 },
    {
      field: 'actionCell',
      headerName: 'Ενέργειες',
      cellRenderer: (params) => {
        if (this.userService.hasFacilityEditorRoleInOrganization(params.data.organizationCode)) {
          return `
            <i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="showEmployee" title="Εμφάνιση προσωπικού" role="button"></i>
            <i class="bi bi-pencil text-success fs-6 action-icon" data-action="editEmployee" title="Επεξεργασία προσωπικού" role="button"></i>
            <i class="bi bi-file-x text-danger fs-6 action-icon" data-action="deleteEmployee" title="Διαγραφή προσωπικού" role="button"></i>
          `;
        } else {
          return `<i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="showEmployee" title="Εμφάνιση προσωπικού" role="button"></i>`
        } 
      },
      filter: false, 
      flex:0.5
    }
  ];

  removeAccents(input: string): string {
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}  
