import useFetch from '../../hooks/useFetch';
import { downloadFile, fetchMyReport } from '../../services/reportService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import StudentPerformance from '../../components/StudentPerformance';

export default function MyReports() {
  const { data, loading, error, reload } = useFetch(fetchMyReport);

  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (loading || !data) return <Loader />;

  return (
    <>
      <PageHeader title="My Reports" subtitle="Your attendance and marks (published results only). Download as PDF or CSV." />
      <StudentPerformance
        report={data}
        onDownload={(format) => downloadFile('/reports/my/export', { format }, `my-report.${format}`)}
      />
    </>
  );
}