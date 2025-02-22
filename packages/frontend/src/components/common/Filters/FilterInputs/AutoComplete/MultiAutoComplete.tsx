import { Menu, Spinner } from '@blueprintjs/core';
import { MenuItem2 } from '@blueprintjs/popover2';
import { MultiSelect2, MultiSelect2Props } from '@blueprintjs/select';
import { FilterableItem } from '@lightdash/common';
import { Highlight } from '@mantine/core';
import Fuse from 'fuse.js';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import {
    MAX_AUTOCOMPLETE_RESULTS,
    useFieldValues,
} from '../../../../../hooks/useFieldValues';
import { useFiltersContext } from '../../FiltersProvider';
import { mergeUniqueValues, toggleValueFromArray } from './autoCompleteUtils';

type Props = {
    filterId: string;
    field: FilterableItem;
    values: string[];
    suggestions: string[];
    onChange: (values: string[]) => void;
} & Pick<
    MultiSelect2Props<unknown>,
    'disabled' | 'placeholder' | 'popoverProps'
>;

const PaddedMenuItem = styled(MenuItem2)`
    .bp4-text-overflow-ellipsis {
        padding: 0 24px;
    }
`;

const MultiAutoComplete: FC<Props> = ({
    filterId,
    values,
    field,
    suggestions: initialSuggestionData,
    popoverProps,
    disabled,
    onChange,
    placeholder,
}) => {
    const { projectUuid, getAutocompleteFilterGroup } = useFiltersContext();
    if (!projectUuid) {
        throw new Error('projectUuid is required in FiltersProvider');
    }

    const [search, setSearch] = useState('');

    const autocompleteFilterGroup = useMemo(
        () => getAutocompleteFilterGroup(filterId, field),
        [field, filterId, getAutocompleteFilterGroup],
    );

    const { isLoading, results: resultsSet } = useFieldValues(
        search,
        initialSuggestionData,
        projectUuid,
        field,
        autocompleteFilterGroup,
        true,
        { refetchOnMount: 'always' },
    );

    const results = useMemo(() => [...resultsSet], [resultsSet]);
    const fuseRef = useRef(
        new Fuse(results, {
            threshold: 0.1,
            findAllMatches: true,
        }),
    );

    const handleItemSelect = useCallback(
        (value: string) => {
            onChange(toggleValueFromArray(values, value));
        },
        [onChange, values],
    );

    const handleOnPaste = useCallback(
        (value: string[]) => {
            onChange(mergeUniqueValues(values, value));
        },
        [onChange, values],
    );

    const handleRemove = useCallback(
        (selectedValue: React.ReactNode) => {
            onChange(values.filter((v: string) => v !== selectedValue));
        },
        [onChange, values],
    );

    const handleOnClose = useCallback(
        (value?: string) => {
            if (!value || value === '') return;
            setSearch('');
            handleItemSelect(value);
        },
        [handleItemSelect, setSearch],
    );

    return (
        <MultiSelect2
            className={disabled ? 'disabled-filter' : ''}
            disabled={disabled}
            fill
            query={search}
            items={results || []}
            selectedItems={values}
            tagInputProps={{
                placeholder: undefined,
                addOnBlur: false,
                tagProps: {
                    minimal: true,
                },
                inputProps: {
                    placeholder:
                        values.length > 0 || disabled ? undefined : placeholder,
                },
                onRemove: handleRemove,
                rightElement: isLoading ? (
                    <Spinner size={16} style={{ margin: 7 }} />
                ) : undefined,
            }}
            popoverProps={{
                minimal: true,
                matchTargetWidth: true,
                onClosing: () => handleOnClose(search),
                ...popoverProps,
            }}
            resetOnSelect
            tagRenderer={(name) => name}
            itemListPredicate={(query, items) => {
                if (query === '') return items;

                fuseRef.current.setCollection(items);
                return fuseRef.current
                    .search(query)
                    .map((result) => result.item);
            }}
            itemRenderer={(name, { handleClick, modifiers, query }) => {
                return (
                    <MenuItem2
                        active={modifiers.active}
                        icon={values.includes(name) ? 'tick' : 'blank'}
                        key={name}
                        text={<Highlight highlight={query}>{name}</Highlight>}
                        onClick={handleClick}
                        shouldDismissPopover={false}
                    />
                );
            }}
            itemListRenderer={({
                itemsParentRef,
                menuProps,
                renderItem,
                filteredItems,
                query,
                renderCreateItem,
            }) => {
                const slicedFilteredItems = filteredItems.slice(
                    0,
                    MAX_AUTOCOMPLETE_RESULTS,
                );
                return (
                    <Menu role="listbox" ulRef={itemsParentRef} {...menuProps}>
                        {isLoading ? (
                            <PaddedMenuItem
                                disabled
                                text="Loading results..."
                            />
                        ) : slicedFilteredItems.length ===
                          MAX_AUTOCOMPLETE_RESULTS ? (
                            <PaddedMenuItem
                                disabled
                                text={`Showing first ${MAX_AUTOCOMPLETE_RESULTS} results. ${
                                    query ? 'Continue' : 'Start'
                                } typing...`}
                            />
                        ) : slicedFilteredItems.length === 0 ? (
                            <PaddedMenuItem disabled text="No results found." />
                        ) : null}

                        {slicedFilteredItems.map(renderItem)}

                        {query ? renderCreateItem() : null}
                    </Menu>
                );
            }}
            onQueryChange={setSearch}
            onItemSelect={handleItemSelect}
            createNewItemRenderer={(
                q: string,
                active: boolean,
                handleClick: React.MouseEventHandler<HTMLElement>,
            ) => (
                <MenuItem2
                    icon="add"
                    text={`Add "${q}"`}
                    active={active}
                    onClick={handleClick}
                    shouldDismissPopover={false}
                />
            )}
            createNewItemFromQuery={(name: string) => name}
            onItemsPaste={handleOnPaste}
        />
    );
};

export default MultiAutoComplete;
