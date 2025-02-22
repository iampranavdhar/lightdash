import { Button, Center, Loader, Menu } from '@mantine/core';
import {
    IconCategory,
    IconChartAreaLine,
    IconFolder,
    IconFolders,
    IconLayoutDashboard,
} from '@tabler/icons-react';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import { useSpaceSummaries } from '../../hooks/useSpaces';
import MantineIcon from '../common/MantineIcon';

interface Props {
    projectUuid: string;
}

const BrowseMenu: FC<Props> = ({ projectUuid }) => {
    const { data: spaces, isLoading } = useSpaceSummaries(projectUuid);

    return (
        <Menu
            withArrow
            shadow="lg"
            position="bottom-start"
            arrowOffset={16}
            offset={-2}
        >
            <Menu.Target>
                <Button
                    variant="default"
                    size="xs"
                    fz="sm"
                    leftIcon={<MantineIcon icon={IconCategory} size="lg" />}
                >
                    Browse
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    component={Link}
                    to={`/projects/${projectUuid}/spaces`}
                    icon={<MantineIcon icon={IconFolders} />}
                >
                    All Spaces
                </Menu.Item>

                <Menu.Item
                    component={Link}
                    to={`/projects/${projectUuid}/dashboards`}
                    icon={<MantineIcon icon={IconLayoutDashboard} />}
                >
                    All dashboards
                </Menu.Item>

                <Menu.Item
                    component={Link}
                    to={`/projects/${projectUuid}/saved`}
                    icon={<MantineIcon icon={IconChartAreaLine} />}
                >
                    All saved charts
                </Menu.Item>

                {isLoading || (spaces && spaces.length > 0) ? (
                    <>
                        <Menu.Divider />
                        <Menu.Label>Spaces</Menu.Label>

                        {isLoading ? (
                            <Center my="sm">
                                <Loader size="sm" color="gray" />
                            </Center>
                        ) : null}
                    </>
                ) : null}

                {spaces
                    ?.sort((a, b) => a.name.localeCompare(b.name))
                    .map((space) => (
                        <Menu.Item
                            key={space.uuid}
                            component={Link}
                            to={`/projects/${projectUuid}/spaces/${space.uuid}`}
                            icon={<MantineIcon icon={IconFolder} />}
                        >
                            {space.name}
                        </Menu.Item>
                    ))}
            </Menu.Dropdown>
        </Menu>
    );
};
export default BrowseMenu;
