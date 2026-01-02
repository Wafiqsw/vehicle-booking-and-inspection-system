import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define TypeScript interface for inspection form data
export interface InspectionFormData {
  // Header Information
  inspectionDate: string;
  vehicleRegNo: string;
  vehicleModel: string;
  project: string;
  currentMileage: string;
  nextServiceDate: string;
  inspectionType: 'pre' | 'post';

  // Inspection Items
  inspectionItems: {
    remoteControl: { functional: boolean; broken: boolean; remark: string };
    brakes: { functional: boolean; broken: boolean; remark: string };
    steering: { functional: boolean; broken: boolean; remark: string };
    autoManualTransaxle: { functional: boolean; broken: boolean; remark: string };
    engineAccelerates: { functional: boolean; broken: boolean; remark: string };
    bodyPanelInspection: { functional: boolean; broken: boolean; remark: string };
    bumperInspection: { functional: boolean; broken: boolean; remark: string };
    doorsInspection: { functional: boolean; broken: boolean; remark: string };
    roofInspection: { functional: boolean; broken: boolean; remark: string };
    exteriorLights: { functional: boolean; broken: boolean; remark: string };
    safetyBelts: { functional: boolean; broken: boolean; remark: string };
    airConditioning: { functional: boolean; broken: boolean; remark: string };
    radio: { functional: boolean; broken: boolean; remark: string };
    navigationSystem: { functional: boolean; broken: boolean; remark: string };
    tiresWheels: { functional: boolean; broken: boolean; remark: string };
  };

  // Staff/Booking Information
  staffName?: string;
  bookingId?: string;

  // Vehicle Images (optional - base64 or URLs)
  vehicleImages?: {
    left?: string | null;
    right?: string | null;
    front?: string | null;
    rear?: string | null;
    top?: string | null;
    frontTyre?: string | null;
    rearTyre?: string | null;
  };

  // Approval and Management
  adminName?: string; // Admin who approved
  adminApprovedDate?: string; // Date when admin approved
  custodianName?: string; // Receptionist/Custodian who managed keys
  custodianReceivedDate?: string; // Date when custodian received/submitted
  staffSubmittedDate?: string; // Date when staff submitted the form
}

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },

  // Header Section
  headerContainer: {
    marginBottom: 15,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  companyLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 10,
    marginBottom: 10,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoColumn: {
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  infoValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
  },

  // Table Section
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderBottomWidth: 1,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#000',
    borderStyle: 'solid',
    backgroundColor: '#d4edda',
    fontWeight: 'bold',
  },
  tableHeaderTitle: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#000',
    borderStyle: 'solid',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  cellLabel: {
    width: '40%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    backgroundColor: '#d4edda',
  },
  cellFunctional: {
    width: '20%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    textAlign: 'center',
  },
  cellBroken: {
    width: '20%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    textAlign: 'center',
  },
  cellRemark: {
    width: '40%',
    padding: 5,
  },

  // Column Header Cells
  headerCell1: {
    width: '40%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
  },
  headerCell2: {
    width: '20%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    textAlign: 'center',
  },
  headerCell3: {
    width: '40%',
    padding: 5,
    textAlign: 'center',
  },

  checkMark: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  beforeUsedTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
  },

  // Vehicle Images Section
  imagesSection: {
    marginTop: 20,
  },
  imagesSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 5,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  imageContainer: {
    width: '48%',
    marginBottom: 15,
  },
  imageLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  vehicleImage: {
    width: '100%',
    height: 150,
    objectFit: 'contain',
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },

  // Signature Section
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 10,
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  signatureDate: {
    fontSize: 8,
    color: '#333',
    textAlign: 'center',
    marginTop: 3,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

// Helper function to render checkmark
const renderCheckmark = (checked: boolean) => {
  return checked ? '/' : '';
};

// Helper component to render vehicle image or placeholder
const VehicleImageItem: React.FC<{ label: string; imageSrc?: string | null }> = ({ label, imageSrc }) => {
  return (
    <View style={styles.imageContainer}>
      <Text style={styles.imageLabel}>{label}</Text>
      {imageSrc ? (
        <Image src={imageSrc} style={styles.vehicleImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No Image Uploaded</Text>
        </View>
      )}
    </View>
  );
};

// Main PDF Document Component
const InspectionFormPDF: React.FC<{ data: InspectionFormData }> = ({ data }) => {
  const inspectionTitle = data.inspectionType === 'pre'
    ? 'BEFORE USED'
    : 'AFTER USED';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.headerContainer}>
          <View style={styles.companyHeader}>
            <Image
              src="/logo.png"
              style={styles.companyLogo}
            />
            <Text style={styles.companyName}>MIE INDUSTRIAL SDN BHD</Text>
          </View>

          <Text style={styles.title}>COMPANY VEHICLE INSPECTION</Text>

          {/* Information Row */}
          <View style={styles.infoRow}>
            {/* Left Column */}
            <View style={styles.infoColumn}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Inspection Date :</Text>
                <Text style={styles.infoValue}>{data.inspectionDate}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Vehicle Reg. No :</Text>
                <Text style={styles.infoValue}>{data.vehicleRegNo}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Vehicle Model :</Text>
                <Text style={styles.infoValue}>{data.vehicleModel}</Text>
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.infoColumn}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Project:</Text>
                <Text style={styles.infoValue}>{data.project}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Current Mileage:</Text>
                <Text style={styles.infoValue}>{data.currentMileage}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Next Service Date:</Text>
                <Text style={styles.infoValue}>{data.nextServiceDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Inspection Table */}
        <View style={styles.table}>
          {/* Table Title */}
          <View style={styles.tableHeaderTitle}>
            <Text style={styles.beforeUsedTitle}>{inspectionTitle}</Text>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell1}>Company Vehicles</Text>
            <Text style={styles.headerCell2}>Functional</Text>
            <Text style={styles.headerCell2}>Broken</Text>
            <Text style={styles.headerCell3}>Remark</Text>
          </View>

          {/* Table Rows */}
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Remote control</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.remoteControl.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.remoteControl.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.remoteControl.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Brakes</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.brakes.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.brakes.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.brakes.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Steering</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.steering.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.steering.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.steering.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Auto/Manual /Transaxle Operation</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.autoManualTransaxle.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.autoManualTransaxle.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.autoManualTransaxle.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Engine Accelerates and Cruises</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.engineAccelerates.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.engineAccelerates.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.engineAccelerates.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Body Panel Inspection</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.bodyPanelInspection.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.bodyPanelInspection.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.bodyPanelInspection.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Bumper Inspection (Front & Back)</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.bumperInspection.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.bumperInspection.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.bumperInspection.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Doors Inspection</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.doorsInspection.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.doorsInspection.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.doorsInspection.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Roof Inspection</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.roofInspection.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.roofInspection.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.roofInspection.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Exterior Lights (Back/Side/Front)</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.exteriorLights.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.exteriorLights.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.exteriorLights.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Safety Belts</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.safetyBelts.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.safetyBelts.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.safetyBelts.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Air Conditioning System</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.airConditioning.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.airConditioning.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.airConditioning.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Radio</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.radio.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.radio.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.radio.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Navigation System</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.navigationSystem.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.navigationSystem.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.navigationSystem.remark}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Tires / Wheels Condition</Text>
            <Text style={styles.cellFunctional}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.tiresWheels.functional)}
              </Text>
            </Text>
            <Text style={styles.cellBroken}>
              <Text style={styles.checkMark}>
                {renderCheckmark(data.inspectionItems.tiresWheels.broken)}
              </Text>
            </Text>
            <Text style={styles.cellRemark}>{data.inspectionItems.tiresWheels.remark}</Text>
          </View>
        </View>

        {/* Vehicle Images Section */}
        {data.vehicleImages && (
          <View style={styles.imagesSection} break>
            <Text style={styles.imagesSectionTitle}>VEHICLE CONDITION IMAGES</Text>
            <View style={styles.imagesGrid}>
              <VehicleImageItem label="Left View" imageSrc={data.vehicleImages.left} />
              <VehicleImageItem label="Right View" imageSrc={data.vehicleImages.right} />
              <VehicleImageItem label="Front View" imageSrc={data.vehicleImages.front} />
              <VehicleImageItem label="Rear View" imageSrc={data.vehicleImages.rear} />
              <VehicleImageItem label="Top View" imageSrc={data.vehicleImages.top} />
              <VehicleImageItem label="Front Tyre" imageSrc={data.vehicleImages.frontTyre} />
              <VehicleImageItem label="Rear Tyre" imageSrc={data.vehicleImages.rearTyre} />
            </View>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          {/* Staff/Driver */}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Driver/Staff:</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>{data.staffName || '______________________'}</Text>
            </View>
            <Text style={styles.signatureRole}>Vehicle User</Text>
            <Text style={styles.signatureDate}>
              Date Submitted: {data.staffSubmittedDate || '__________'}
            </Text>
          </View>

          {/* Admin Approval */}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Approved By:</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>{data.adminName || '______________________'}</Text>
            </View>
            <Text style={styles.signatureRole}>Admin</Text>
            <Text style={styles.signatureDate}>
              Date Approved: {data.adminApprovedDate || '__________'}
            </Text>
          </View>
        </View>

        {/* Custodian Section (on new line if needed) */}
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.signatureLabel}>Vehicle Custodian:</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>{data.custodianName || '______________________'}</Text>
            </View>
            <Text style={styles.signatureRole}>Receptionist/Key Manager</Text>
            <Text style={styles.signatureDate}>
              Date Received: {data.custodianReceivedDate || '__________'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is a system-generated document. Generated on {new Date().toLocaleString('en-MY', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          <Text style={{ marginTop: 3 }}>
            MIE Industrial SDN BHD - Vehicle Booking and Inspection Management System
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InspectionFormPDF;
