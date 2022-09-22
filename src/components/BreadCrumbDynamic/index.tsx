import Breadcrumb from 'antd/lib/breadcrumb/Breadcrumb';
import { Link } from 'umi';

type BreadCrumbBite = {
  title: string;
  route: string;
};
export type BreadCrumbDynamicProps = {
  breadLine: BreadCrumbBite[];
};

const BreadCrumbDynamic: React.FC<BreadCrumbDynamicProps> = ({ breadLine }) => {
  return (
    <Breadcrumb style={{ paddingBottom: '15px' }}>
      {breadLine.map((crumb, index) => {
        return (
          <Breadcrumb.Item key={crumb.route}>
            <Link to={crumb.route}>{crumb.title}</Link>
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadCrumbDynamic;
