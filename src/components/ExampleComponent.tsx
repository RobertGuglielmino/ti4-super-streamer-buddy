
interface ExampleComponentProps {
  title: string;
  data: any;
}

function ExampleComponent({ title, data }: ExampleComponentProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      {data ? (
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      )}
    </div>
  );
}

export default ExampleComponent;