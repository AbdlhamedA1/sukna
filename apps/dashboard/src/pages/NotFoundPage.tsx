import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="The page you requested does not exist."
      extra={
        <Link to="/">
          <Button type="primary">Back to Dashboard</Button>
        </Link>
      }
    />
  );
}
