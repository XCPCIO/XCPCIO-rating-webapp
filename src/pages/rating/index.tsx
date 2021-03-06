import React from 'react';
import style from './index.less';
import { Loading } from '@/components/Loading';
import Highlighter from 'react-highlight-words';
import { Table, Input, Space, Button, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { TeamRating, fetchData } from './model';
import { RatingSpan } from '@/components/Rating';
import { RatingGraph } from './components/RatingGraph';

function ratingRender(rating: number) {
    return <RatingSpan rating={rating} />;
}

class Rating extends React.Component {
    async componentWillMount() {
        const urlPrefix = this.props.match.params.id;
        const { ratingConfig, teamRatingList } = await fetchData(urlPrefix);
        let columns: any = [];
        columns = [
            {
                title: 'Handle',
                dataIndex: 'handle',
                key: 'handle',
                width: '15%',
                align: 'left',
                ...this.getColumnSearchProps('handle'),
                render: (handle: string) => {
                    return (
                        <Tooltip placement="top" title={handle}>
                            <span className={style.col}>{handle}</span>
                        </Tooltip>
                    );
                },
            },
            {
                title: ratingConfig.organization || 'organization',
                dataIndex: 'organization',
                key: 'organization',
                width: '12%',
                align: 'left',
                ...this.getColumnSearchProps('organization'),
            },
            {
                title: 'TeamName',
                dataIndex: 'name',
                key: 'name',
                width: '50%',
                align: 'left',
                ...this.getColumnSearchProps('name'),
                render: (name: string) => {
                    return (
                        <Tooltip placement="top" title={name}>
                            <span className={style.col}>{name}</span>
                        </Tooltip>
                    );
                },
            },
            {
                title: 'Rating',
                dataIndex: 'rating',
                key: 'rating',
                align: 'left',
                width: '10%',
                sorter: (a: TeamRating, b: TeamRating) => a.rating - b.rating,
                render: ratingRender,
            },
            {
                title: 'MaxRating',
                dataIndex: 'maxRating',
                key: 'maxRating',
                align: 'left',
                width: '10%',
                sorter: (a: TeamRating, b: TeamRating) =>
                    a.maxRating - b.maxRating,
                render: ratingRender,
            },
        ];

        this.setState({
            loaded: true,
            columns: columns,
            tableData: teamRatingList,
            title: ratingConfig.name,
        });
    }

    constructor(props: any) {
        super(props);
    }

    state = {
        loaded: false,
        columns: [],
        tableData: [],
        title: '',
    };

    getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={(node) => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        this.handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            this.handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => this.handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{ color: filtered ? '#1890ff' : undefined }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: (text) =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text.toString()}
                />
            ) : (
                text
            ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = (clearFilters) => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    render() {
        return (
            <div className={style.root}>
                {this.state.loaded === false && (
                    <div className={style.loading}>
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && (
                    <>
                        <div className={style.title}>{this.state.title}</div>
                        <Table
                            style={{ paddingTop: 0 }}
                            size="small"
                            columns={this.state.columns}
                            dataSource={this.state.tableData}
                            className={style.Table}
                            expandable={{
                                columnWidth: '3%',
                                expandRowByClick: true,
                                expandedRowRender: (record: TeamRating) => (
                                    <RatingGraph ratingData={record.history} />
                                ),
                            }}
                            pagination={{
                                hideOnSinglePage: true,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                defaultPageSize: 32,
                                pageSizeOptions: ['8', '16', '32', '64', '128'],
                            }}
                        />
                    </>
                )}
            </div>
        );
    }
}

export default Rating;
