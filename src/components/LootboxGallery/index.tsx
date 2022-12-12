import { LootboxTournamentStatus, LootboxType } from '@/api/graphql/generated/types';
import { MenuOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import { Address, LootboxID, LootboxTournamentSnapshotID, TournamentID } from '@wormgraph/helpers';
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Empty,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Input,
  Row,
  Col,
  notification,
  Spin,
  Select,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import GenerateReferralModal from '../GenerateReferralModal';
import styles from './index.less';
import { $Horizontal } from '@/components/generics';

interface LootboxSnapshotFE {
  id: LootboxTournamentSnapshotID;
  address: Address | null;
  lootboxID: LootboxID;
  stampImage: string;
  status: LootboxTournamentStatus;
  name: string;
  impressionPriority: number;
  type: LootboxType;
  timestamps: {
    createdAt: number;
  };
}
interface LootboxGalleryProps {
  eventID: TournamentID;
  lootboxTournamentSnapshots: LootboxSnapshotFE[];
  loading: boolean;
  pageSize: number;
  mode: 'view-only' | 'view-edit';
  onBulkDelete: (
    eventID: TournamentID,
    lootboxSnapshotIDs: LootboxTournamentSnapshotID[],
  ) => Promise<void>;
  onBulkEdit: (
    eventID: TournamentID,
    lootboxSnapshotIDs: LootboxTournamentSnapshotID[],
    payload: {
      impressionPriority?: number;
      status?: LootboxTournamentStatus;
    },
  ) => Promise<void>;
}

enum ShowLootboxType {
  All = 'All',
  Teams = 'Teams',
  Airdrops = 'Airdrops',
}

const LootboxGallery = (props: LootboxGalleryProps) => {
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [lootboxForReferralModal, setLootboxForReferralModal] = useState<LootboxID | null>(null);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLootboxType, setShowLootboxType] = useState<ShowLootboxType>(ShowLootboxType.All);
  const [bulkSelectedSnapshots, setBulkSelectedSnapshots] = useState<LootboxTournamentSnapshotID[]>(
    [],
  );
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (loadingAction) {
      notification.info({
        key: 'loading-action',
        icon: <Spin />,
        message: 'Loading... Please wait.',
        duration: 0,
      });
    } else {
      notification.close('loading-action');
    }
  }, [loadingAction]);

  const isAllChecked = useMemo(() => {
    return bulkSelectedSnapshots.length === props.lootboxTournamentSnapshots.length;
  }, [bulkSelectedSnapshots, props.lootboxTournamentSnapshots]);

  const paginatedLootboxes: LootboxSnapshotFE[] = useMemo(() => {
    const shownLootboxSnapshots = props.lootboxTournamentSnapshots.filter((s) => {
      if (showLootboxType === ShowLootboxType.Teams)
        return !s.type || s.type === LootboxType.Compete;
      if (showLootboxType === ShowLootboxType.Airdrops)
        return s.type && s.type === LootboxType.Airdrop;
      return true;
    });
    if (searchString === '') {
      const startIndex = (currentPage - 1) * props.pageSize;
      const endIndex = startIndex + props.pageSize;
      return shownLootboxSnapshots.slice(startIndex, endIndex);
    } else {
      return shownLootboxSnapshots.filter(
        (snap) =>
          snap.name?.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
          snap.id?.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
          (snap.address && snap.address.toLowerCase().indexOf(searchString.toLowerCase()) > -1),
      );
    }
  }, [
    currentPage,
    props.lootboxTournamentSnapshots,
    props.pageSize,
    searchString,
    showLootboxType,
  ]);

  const handleToggleAll = () => {
    if (!isAllChecked) {
      setBulkSelectedSnapshots(props.lootboxTournamentSnapshots.map((snap) => snap.id));
    } else {
      setBulkSelectedSnapshots([]);
    }
  };

  const handleOnPageChange = (pageNumber: number, pageSize: number) => {
    setCurrentPage(pageNumber);
  };

  const handleBulkDelete = async (snapshotIDs: LootboxTournamentSnapshotID[]) => {
    if (props.mode !== 'view-edit') {
      Modal.error({
        title: 'Error',
        content: 'You do not have permission to delete Lootboxes.',
      });
      return;
    }
    const nLootboxToDelete = snapshotIDs.length;
    if (nLootboxToDelete === 0) {
      Modal.error({
        title: 'No lootboxes selected',
        content: 'Please select at least one Lootbox to delete',
      });
      return;
    }
    setLoadingAction(true);
    try {
      await props.onBulkDelete(props.eventID, snapshotIDs);
      Modal.success({
        title: `Lootbox${nLootboxToDelete > 1 ? 'es' : ''} deleted`,
        content: `The selected Lootbox${nLootboxToDelete > 1 ? 'es have' : ' has'} been deleted`,
      });
    } catch (e) {
      console.error(e);
      Modal.error({
        title: 'Failure',
        content: 'Something went wrong. Please try again later',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBulkEdit = async (
    snapshotIDs: LootboxTournamentSnapshotID[],
    payload: {
      status?: LootboxTournamentStatus;
      impressionPriority?: number;
    },
  ) => {
    if (props.mode !== 'view-edit') {
      Modal.error({
        title: 'Error',
        content: 'You do not have permission to edit Lootboxes.',
      });
      return;
    }
    if (snapshotIDs.length === 0) {
      Modal.error({
        title: 'No lootboxes selected',
        content: 'Please select at least one Lootbox to edit',
      });
      return;
    }
    if (payload.impressionPriority == null && payload.status == null) {
      Modal.error({
        title: 'No changes made',
        content: 'Please select at least one field to edit',
      });
      return;
    }
    setLoadingAction(true);

    try {
      await props.onBulkEdit(props.eventID, snapshotIDs, {
        status: payload.status,
        impressionPriority: payload.impressionPriority,
      });
      Modal.success({
        title: 'Success',
        content: 'Lootboxes updated successfully.',
      });
    } catch (err) {
      console.error(err);
      Modal.error({
        title: 'Failure',
        content: 'An error occured. Please try again later.',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const isBulkActionEnabled = bulkSelectedSnapshots.length > 0;

  const bulkEditLootboxSnapshotMenu = (
    <Menu
      items={[
        {
          key: `bulk-state-activate`,
          label: (
            <Tooltip
              title="All selected Lootboxes will become visible and claimable by your audience"
              placement="left"
            >
              <Button type="text" ghost>
                Activate
              </Button>
            </Tooltip>
          ),
          onClick: () => {
            handleBulkEdit(bulkSelectedSnapshots, {
              status: LootboxTournamentStatus.Active,
            });
          },
        },
        {
          key: `bulk-state-disable`,
          label: (
            <Tooltip
              title="All selected Lootboxes will become invisible and not-claimable by your audience"
              placement="left"
            >
              <Button type="text" ghost>
                Deactivate
              </Button>
            </Tooltip>
          ),
          onClick: () => {
            handleBulkEdit(bulkSelectedSnapshots, {
              status: LootboxTournamentStatus.Disabled,
            });
          },
        },
        {
          key: `bulk-delete`,
          danger: true,
          label: (
            <Popconfirm
              title={`Delete ${bulkSelectedSnapshots.length} Lootbox${
                bulkSelectedSnapshots.length > 1 ? 'es' : ''
              }?`}
              onConfirm={() => handleBulkDelete(bulkSelectedSnapshots)}
            >
              <Tooltip title="Deletes all selected Lootboxes permanently" placement="left">
                <Button type="text" danger ghost>
                  Delete
                </Button>
              </Tooltip>
            </Popconfirm>
          ),
        },
      ]}
    />
  );

  if (!props.lootboxTournamentSnapshots || props.lootboxTournamentSnapshots.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 60,
        }}
        description={
          <span style={{ maxWidth: '200px' }}>
            {`There are no Lootboxes for this event. Create one to get started.`}
          </span>
        }
        style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
      >
        <Link to={`/dashboard/lootbox/create?tid=${props.eventID}`}>
          <Button>Create Lootbox</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between">
        <Col span={12}>
          <$Horizontal>
            <Select
              defaultValue={showLootboxType}
              style={{ width: 200 }}
              onChange={(v: ShowLootboxType) => setShowLootboxType(v)}
              options={[
                {
                  value: ShowLootboxType.All,
                  label: 'Show All',
                },
                {
                  value: ShowLootboxType.Teams,
                  label: 'Teams Only',
                },
                {
                  value: ShowLootboxType.Airdrops,
                  label: 'Airdrops Only',
                },
              ]}
            />
            <Input.Search
              width="100%"
              placeholder="Seach by Lootbox name or address"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </$Horizontal>
        </Col>
        <Row>
          <Col span={12}>
            <Space>
              <Checkbox
                checked={isAllChecked}
                onChange={handleToggleAll}
                style={{ whiteSpace: 'nowrap' }}
              >
                Select all
              </Checkbox>

              <Dropdown
                disabled={loadingAction || !isBulkActionEnabled}
                overlay={bulkEditLootboxSnapshotMenu}
              >
                <Button disabled={loadingAction || !isBulkActionEnabled} type="primary">
                  Bulk Edit
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Row>
      <div className={styles.content}>
        {paginatedLootboxes.map((snapshot) => {
          const isChecked = bulkSelectedSnapshots.includes(snapshot.id);
          const editLootboxSnapshotMenu = (
            <Menu
              items={[
                {
                  key: `view-${snapshot.id}`,
                  label: (
                    <Tooltip
                      title="View detailed information about the Lootbox and edit it if you have permission"
                      placement="left"
                    >
                      <Link
                        key={`view-${snapshot.lootboxID}`}
                        to={`/dashboard/lootbox/id/${snapshot.lootboxID}?tid=${props.eventID}`}
                        target="_blank"
                      >
                        <Button type="text" ghost>
                          View
                        </Button>
                      </Link>
                    </Tooltip>
                  ),
                },
                {
                  key: `stamp-${snapshot.id}`,
                  label: (
                    <Tooltip
                      title="Generate viral and shareable graphics for this Lootbox"
                      placement="left"
                    >
                      <Link
                        key={`stamp-${snapshot.lootboxID}`}
                        to={`/dashboard/stamp/lootbox/id/${snapshot.lootboxID}?tid=${props.eventID}`}
                        target="_blank"
                      >
                        <Button type="text" ghost>
                          Stamp
                        </Button>
                      </Link>
                    </Tooltip>
                  ),
                },
                {
                  key: `state-activate-${snapshot.id}`,
                  label: (
                    <Tooltip title="Generate a referral link for this Lootbox" placement="left">
                      <Button type="text" ghost>
                        Invite Fans
                      </Button>
                    </Tooltip>
                  ),
                  onClick: () => {
                    setLootboxForReferralModal(snapshot.lootboxID);
                    setIsReferralModalOpen(true);
                  },
                },
                {
                  key: `visibility-up-${snapshot.id}`,
                  label: (
                    <Tooltip
                      title="Increases the chances that this Lootbox will be seen in the Viral Onboarding"
                      placement="left"
                    >
                      <Button type="text" ghost>
                        <ArrowUpOutlined /> Visibility
                      </Button>
                    </Tooltip>
                  ),
                  onClick: () => {
                    handleBulkEdit([snapshot.id], {
                      impressionPriority: snapshot.impressionPriority + 1,
                    });
                  },
                },
                {
                  key: `visibility-down-${snapshot.id}`,
                  label: (
                    <Tooltip
                      title="Decreases the chances that this Lootbox will be seen in the Viral Onboarding"
                      placement="left"
                    >
                      <Button type="text" ghost>
                        <ArrowDownOutlined /> Visibility
                      </Button>
                    </Tooltip>
                  ),
                  onClick: () => {
                    handleBulkEdit([snapshot.id], {
                      impressionPriority: snapshot.impressionPriority - 1,
                    });
                  },
                },
                {
                  key: `state-${snapshot.id}`,
                  label:
                    snapshot.status === LootboxTournamentStatus.Active ? (
                      <Tooltip
                        title="Your audience will not see this Lootbox and cannot claim it"
                        placement="left"
                      >
                        <Button type="text" ghost>
                          Deactivate
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title="This Lootbox will be visible and claimable by your audience"
                        placement="left"
                      >
                        <Button type="text" ghost>
                          Activate
                        </Button>
                      </Tooltip>
                    ),
                  onClick: () => {
                    handleBulkEdit([snapshot.id], {
                      status:
                        snapshot.status === LootboxTournamentStatus.Active
                          ? LootboxTournamentStatus.Disabled
                          : LootboxTournamentStatus.Active,
                    });
                  },
                },
                {
                  key: `del-${snapshot.id}`,
                  danger: true,
                  label: (
                    <Popconfirm
                      title={`Delete Lootbox "${snapshot.name}"?`}
                      onConfirm={() => handleBulkDelete([snapshot.id])}
                    >
                      <Tooltip title="Delete this Lootbox from your event" placement="left">
                        <Button type="text" danger ghost>
                          Delete
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          );
          return (
            <Link
              key={`view-${snapshot.lootboxID}`}
              to={`/dashboard/lootbox/id/${snapshot.lootboxID}?tid=${props.eventID}`}
              target="_blank"
            >
              <Card
                key={snapshot.lootboxID}
                hoverable
                className={styles.card}
                title={
                  <Checkbox
                    checked={isChecked}
                    key={`CB-${snapshot.lootboxID}`}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkSelectedSnapshots((prev) => {
                          return [...prev, snapshot.id];
                        });
                      } else {
                        setBulkSelectedSnapshots((prev) => {
                          return prev.filter((id) => id !== snapshot.id);
                        });
                      }
                    }}
                  />
                }
                extra={
                  <Space size="middle">
                    <Dropdown
                      key={`ellipsis-${snapshot.lootboxID}`}
                      overlay={editLootboxSnapshotMenu}
                      trigger={['click', 'hover']}
                    >
                      <MenuOutlined />
                    </Dropdown>
                  </Space>
                }
                cover={
                  <img alt="example" src={snapshot.stampImage || ''} className={styles.cardImage} />
                }
              >
                <Card.Meta
                  title={snapshot.name}
                  description={
                    <$Horizontal>
                      {snapshot.status === LootboxTournamentStatus.Active && (
                        <Tooltip title="Active Lootboxes are visible and redeemable by your audience">
                          <Tag color="success">Active</Tag>
                        </Tooltip>
                      )}
                      {snapshot.status === LootboxTournamentStatus.Disabled && (
                        <Tooltip title="Disabled Lootboxes are not visible or redeemable by your audience">
                          <Tag color="warning">Disabled</Tag>
                        </Tooltip>
                      )}

                      {snapshot.type && snapshot.type === LootboxType.Airdrop && (
                        <Tooltip title="Airdrop Lootboxes do NOT represent a team and are NOT publically visible. Use Airdrops to send rewards directly to a group of fans.">
                          <Tag color="processing">Airdrop</Tag>
                        </Tooltip>
                      )}
                    </$Horizontal>
                  }
                />
              </Card>
            </Link>
          );
        })}
        {props.loading &&
          Array.from(new Array(10)).map((_, idx) => <Card key={`loading-${idx}`} loading />)}
      </div>
      <br />
      <Pagination
        defaultCurrent={1}
        total={props.lootboxTournamentSnapshots.length}
        pageSize={props.pageSize}
        onChange={handleOnPageChange}
        style={{ textAlign: 'center' }}
      />
      <GenerateReferralModal
        isOpen={isReferralModalOpen}
        setIsOpen={setIsReferralModalOpen}
        lootboxID={lootboxForReferralModal || undefined}
        tournamentID={props.eventID}
      />
    </Space>
  );
};

export default LootboxGallery;
